import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  IsNotEmpty,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const PAYMENT_METHODS = ['UPI', 'Bank Transfer', 'NEFT', 'RTGS', 'Other'] as const;
const COUNTER_PAYMENT_MODES = [
  'Cash', 'Cash at Counter', 'UPI', 'Bank Transfer', 'Net Banking', 'NEFT', 'RTGS',
  'Debit / Credit Card', 'Bank Challan', 'Other',
] as const;
const PROOF_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;

export class UploadPaymentProofDto {
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(10_000_000)
  amount!: number;

  @IsDateString({ strict: true })
  paymentDate!: string;

  @IsString()
  @IsIn(PAYMENT_METHODS)
  paymentMethod!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(128)
  transactionId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  head?: string;

  @IsString()
  @MaxLength(7_100_000)
  fileData!: string;

  @IsString()
  @MaxLength(128)
  fileName!: string;

  @IsString()
  @IsIn(PROOF_MIME_TYPES)
  fileType!: string;
}

export class RejectPaymentProofDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  rejectionReason!: string;
}

export class RecordFeePaymentDto {
  @IsUUID('4')
  idempotencyKey!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  rollNumber!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  semester!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  head!: string;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(10_000_000)
  amount!: number;

  @IsString()
  @IsIn(COUNTER_PAYMENT_MODES)
  @MinLength(1)
  @MaxLength(64)
  mode!: string;
}

export class CreateFeeStructureDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  program!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  term!: string;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10_000_000)
  tuitionFee!: number;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10_000_000)
  developmentFee!: number;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10_000_000)
  labLibraryFee!: number;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10_000_000)
  examinationFee!: number;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10_000_000)
  hostelMessFee!: number;
}

export class SanctionScholarshipDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  authority!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  category!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  studentRoll!: string;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(10_000_000)
  amount!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100_000)
  beneficiaries!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  academicYear!: string;
}
