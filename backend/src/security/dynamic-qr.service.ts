import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface DynamicQrPayload {
  sub: string;
  role: string;
  identityType: string;
  identifier: string;
  name?: string;
  department?: string;
  hostelName?: string;
  roomNumber?: string;
  nonce: string;
  iat: number; // millisecond timestamp
  exp: number; // millisecond timestamp (iat + 10000)
}

export interface DynamicQrResult {
  token: string;
  tokenHash: string;
  expiresInSeconds: number;
  serverIssuedAt: string;
  serverExpiresAt: string;
  identity: {
    userId: string;
    role: string;
    identityType: string;
    identifier: string;
    name?: string;
    department?: string;
    hostelName?: string;
    roomNumber?: string;
  };
}

export interface TokenVerificationResult {
  valid: boolean;
  status:
    | 'TOKEN_VALID'
    | 'QR_EXPIRED'
    | 'QR_ALREADY_USED'
    | 'INVALID_QR'
    | 'INACTIVE_ACCOUNT'
    | 'UNAUTHORIZED';
  message: string;
  payload?: DynamicQrPayload;
  expiredSecondsAgo?: number;
}

@Injectable()
export class DynamicQrService {
  private readonly logger = new Logger(DynamicQrService.name);
  private readonly secretKey: string =
    process.env.DYNAMIC_QR_SECRET || 'apna-campus-dynamic-qr-secure-hmac-key-2026-production';

  // In-memory fallback map for offline or fast atomic token store
  // key: tokenHash -> { tokenHash, userId, isUsed, usedAt, expiresAt, payload }
  private static memoryTokenStore = new Map<
    string,
    {
      tokenHash: string;
      userId: string;
      isUsed: boolean;
      usedAt: Date | null;
      expiresAt: Date;
      payload: DynamicQrPayload;
    }
  >();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a fresh 10-second cryptographically signed Dynamic QR token.
   * Universal for Student, Faculty, Teaching Staff, Non-Teaching Staff, and authorized personnel.
   */
  async generateToken(user: {
    id: string;
    role?: string;
    identityType?: string;
    identifier?: string;
    name?: string;
    department?: string;
    hostelName?: string;
    roomNumber?: string;
  }): Promise<DynamicQrResult> {
    const now = Date.now();
    const validityMs = 10 * 1000; // Strictly 10 seconds
    const exp = now + validityMs;

    const payload: DynamicQrPayload = {
      sub: user.id,
      role: (user.role || 'STUDENT').toUpperCase(),
      identityType: (user.identityType || user.role || 'STUDENT').toUpperCase(),
      identifier: user.identifier || user.id,
      name: user.name,
      department: user.department,
      hostelName: user.hostelName,
      roomNumber: user.roomNumber,
      nonce: crypto.randomBytes(12).toString('hex'),
      iat: now,
      exp: exp,
    };

    const headerBase64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'AC-QR' })).toString('base64url');
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', this.secretKey)
      .update(`${headerBase64}.${payloadBase64}`)
      .digest('base64url');

    const token = `ACQR.${headerBase64}.${payloadBase64}.${signature}`;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresDate = new Date(exp);
    const issuedDate = new Date(now);

    // Save to in-memory store
    DynamicQrService.memoryTokenStore.set(tokenHash, {
      tokenHash,
      userId: user.id,
      isUsed: false,
      usedAt: null,
      expiresAt: expiresDate,
      payload,
    });

    // Prune old memory tokens (older than 2 minutes)
    const twoMinutesAgo = Date.now() - 120000;
    for (const [hash, entry] of DynamicQrService.memoryTokenStore.entries()) {
      if (entry.expiresAt.getTime() < twoMinutesAgo) {
        DynamicQrService.memoryTokenStore.delete(hash);
      }
    }

    // Persist to Prisma DB if database is connected
    try {
      if (this.prisma && this.prisma.dynamicQrToken) {
        await this.prisma.dynamicQrToken.create({
          data: {
            tokenHash,
            userId: user.id,
            userRole: payload.role,
            identityType: payload.identityType,
            identifier: payload.identifier,
            nonce: payload.nonce,
            issuedAt: issuedDate,
            expiresAt: expiresDate,
            isUsed: false,
          },
        });
      }
    } catch (err: any) {
      this.logger.debug(`Prisma save token skipped/fallback: ${err?.message}`);
    }

    return {
      token,
      tokenHash,
      expiresInSeconds: 10,
      serverIssuedAt: issuedDate.toISOString(),
      serverExpiresAt: expiresDate.toISOString(),
      identity: {
        userId: user.id,
        role: payload.role,
        identityType: payload.identityType,
        identifier: payload.identifier,
        name: payload.name,
        department: payload.department,
        hostelName: payload.hostelName,
        roomNumber: payload.roomNumber,
      },
    };
  }

  /**
   * Verifies an incoming Dynamic QR token presentation.
   * Performs cryptographic signature check, strict server-side 10-second validity check,
   * and single-use replay prevention.
   */
  async verifyToken(tokenString: string, checkpointId?: string): Promise<TokenVerificationResult> {
    if (!tokenString || typeof tokenString !== 'string') {
      return {
        valid: false,
        status: 'INVALID_QR',
        message: 'Invalid QR token format or empty scan.',
      };
    }

    const trimmed = tokenString.trim();
    if (!trimmed.startsWith('ACQR.')) {
      return {
        valid: false,
        status: 'INVALID_QR',
        message: 'Unrecognized QR code schema. Only official Apna Campus dynamic passes are supported.',
      };
    }

    const parts = trimmed.split('.');
    if (parts.length !== 4) {
      return {
        valid: false,
        status: 'INVALID_QR',
        message: 'Malformed QR token envelope.',
      };
    }

    const [, headerBase64, payloadBase64, signature] = parts;

    // 1. Verify Cryptographic HMAC Signature
    const expectedSig = crypto.createHmac('sha256', this.secretKey)
      .update(`${headerBase64}.${payloadBase64}`)
      .digest('base64url');

    if (
      signature.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
    ) {
      return {
        valid: false,
        status: 'INVALID_QR',
        message: 'Cryptographic signature mismatch. Token is unauthorized or tampered with.',
      };
    }

    // 2. Decode Payload
    let payload: DynamicQrPayload;
    try {
      payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    } catch {
      return {
        valid: false,
        status: 'INVALID_QR',
        message: 'Failed to decode token payload JSON.',
      };
    }

    // 3. Strict Server-Side 10-Second Expiration Check
    const now = Date.now();
    if (now > payload.exp) {
      const expiredSecs = Math.round((now - payload.exp) / 1000);
      return {
        valid: false,
        status: 'QR_EXPIRED',
        message: `Dynamic QR expired ${expiredSecs}s ago. Tokens are valid for exactly 10 seconds. Please scan a fresh QR.`,
        expiredSecondsAgo: expiredSecs,
        payload,
      };
    }

    // 4. Compute Hash & Verify Single-Use (Replay Prevention)
    const tokenHash = crypto.createHash('sha256').update(trimmed).digest('hex');

    // Atomic check in memory first
    const memRecord = DynamicQrService.memoryTokenStore.get(tokenHash);
    if (memRecord) {
      if (memRecord.isUsed) {
        return {
          valid: false,
          status: 'QR_ALREADY_USED',
          message: 'QR code was already scanned and consumed. Replay attempt blocked.',
          payload,
        };
      }
      // Mark as used atomically
      memRecord.isUsed = true;
      memRecord.usedAt = new Date(now);
    }

    // Atomic database update if connected
    try {
      if (this.prisma && this.prisma.dynamicQrToken) {
        const dbRecord = await this.prisma.dynamicQrToken.findUnique({
          where: { tokenHash },
        });

        if (dbRecord) {
          if (dbRecord.isUsed) {
            return {
              valid: false,
              status: 'QR_ALREADY_USED',
              message: 'Token was previously consumed at gate. Duplicate scans rejected.',
              payload,
            };
          }

          await this.prisma.dynamicQrToken.update({
            where: { tokenHash },
            data: {
              isUsed: true,
              usedAt: new Date(now),
              gateId: checkpointId || null,
            },
          });
        } else {
          // If created during disconnected state or mock, insert marked as used
          await this.prisma.dynamicQrToken.create({
            data: {
              tokenHash,
              userId: payload.sub,
              userRole: payload.role,
              identityType: payload.identityType,
              identifier: payload.identifier,
              nonce: payload.nonce,
              issuedAt: new Date(payload.iat),
              expiresAt: new Date(payload.exp),
              isUsed: true,
              usedAt: new Date(now),
              gateId: checkpointId || null,
            },
          });
        }
      }
    } catch (err: any) {
      this.logger.debug(`Prisma token update fallback: ${err?.message}`);
    }

    return {
      valid: true,
      status: 'TOKEN_VALID',
      message: 'Dynamic QR token verified successfully within 10-second validity window.',
      payload,
    };
  }
}
