import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScanGatePassDto {
  @ApiPropertyOptional({ description: 'Scanned digital QR code string', example: 'BPUT-GP-2026-1039-PRIYA-PATRA-APPROVED' })
  @IsString()
  @IsOptional()
  qrCode?: string;

  @ApiPropertyOptional({ description: 'Student roll number for manual lookup', example: '01' })
  @IsString()
  @IsOptional()
  rollNumber?: string;

  @ApiPropertyOptional({ description: 'Pass ID for manual lookup', example: 'GP-2026-1042' })
  @IsString()
  @IsOptional()
  passId?: string;
}

export class RecordMovementDto {
  @ApiProperty({ description: 'Unique Pass ID or WorkflowRequest ID', example: 'GP-2026-1039' })
  @IsString()
  @IsNotEmpty()
  passId!: string;

  @ApiProperty({ description: 'Student Roll Number', example: '02' })
  @IsString()
  @IsNotEmpty()
  rollNumber!: string;

  @ApiProperty({ description: 'Movement direction (EXIT or ENTRY)', example: 'EXIT', enum: ['EXIT', 'ENTRY'] })
  @IsEnum(['EXIT', 'ENTRY'])
  @IsNotEmpty()
  direction!: 'EXIT' | 'ENTRY';

  @ApiPropertyOptional({ description: 'Gate checkpoint name', example: 'Main Campus Gate 1' })
  @IsString()
  @IsOptional()
  gateName?: string;

  @ApiPropertyOptional({ description: 'Duty Security Guard ID', example: 'SEC-101' })
  @IsString()
  @IsOptional()
  guardId?: string;

  @ApiPropertyOptional({ description: 'Duty Security Guard Name', example: 'Dillip Kumar Pradhan' })
  @IsString()
  @IsOptional()
  guardName?: string;

  @ApiPropertyOptional({ description: 'Guard observation remarks', example: 'Luggage inspected. Exited via turnstile 2.' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Unique UUID for offline queue synchronization deduplication' })
  @IsString()
  @IsOptional()
  offlineSyncId?: string;
}

export class WalkInVisitorDto {
  @ApiProperty({ description: 'Full name of visitor', example: 'Mr. Ramesh Nayak' })
  @IsString()
  @IsNotEmpty()
  visitorName!: string;

  @ApiProperty({ description: 'Relation to student', example: 'Father' })
  @IsString()
  @IsNotEmpty()
  relation!: string;

  @ApiProperty({ description: 'Host student full name', example: 'Rakesh Das' })
  @IsString()
  @IsNotEmpty()
  studentName!: string;

  @ApiProperty({ description: 'Host student roll number', example: '01' })
  @IsString()
  @IsNotEmpty()
  rollNumber!: string;

  @ApiProperty({ description: 'Visit purpose', example: 'Delivering study material and prescription medications' })
  @IsString()
  @IsNotEmpty()
  purpose!: string;

  @ApiPropertyOptional({ description: 'Visitor phone number', example: '+91 94370 12345' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Government ID proof number', example: 'XXXX-XXXX-9842' })
  @IsString()
  @IsOptional()
  idProofNumber?: string;

  @ApiPropertyOptional({ description: 'Physical gate pass badge issued', example: 'BADGE-V-14' })
  @IsString()
  @IsOptional()
  badgeNumber?: string;

  @ApiPropertyOptional({ description: 'Gate checkpoint', example: 'Gate 1' })
  @IsString()
  @IsOptional()
  gateNumber?: string;
}

export class VerifyVisitorCodeDto {
  @ApiProperty({ description: '6-digit pre-approved visitor entry code', example: '782914' })
  @IsString()
  @IsNotEmpty()
  verificationCode!: string;
}

export class ReportSecurityIncidentDto {
  @ApiProperty({ description: 'Incident title', example: 'Unauthorized Exit Attempt Without Approved Outpass' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Affected Student Roll Number', example: '01' })
  @IsString()
  @IsOptional()
  affectedRollNumber?: string;

  @ApiPropertyOptional({ description: 'Student Name', example: 'Rakesh Das' })
  @IsString()
  @IsOptional()
  studentName?: string;

  @ApiPropertyOptional({ description: 'Hostel Name', example: 'Gandhi Boys Residence' })
  @IsString()
  @IsOptional()
  hostelName?: string;

  @ApiPropertyOptional({ description: 'Incident Category', example: 'Gate Perimeter Breach' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Detailed guard statement of incident' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ description: 'Incident severity level', example: 'high', enum: ['low', 'medium', 'high', 'critical'] })
  @IsString()
  @IsOptional()
  severity?: string;

  @ApiPropertyOptional({ description: 'Gate checkpoint where incident occurred', example: 'Main Campus Gate 1' })
  @IsString()
  @IsOptional()
  gateName?: string;
}

export class SyncOfflineQueueDto {
  @ApiProperty({ description: 'Array of queued physical movements recorded offline' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordMovementDto)
  movements!: RecordMovementDto[];
}

