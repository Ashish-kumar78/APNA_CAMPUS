import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BonafidePurposeDtoEnum {
  INTERNSHIP = 'INTERNSHIP',
  SCHOLARSHIP_HOSTELLER = 'SCHOLARSHIP_HOSTELLER',
  STUDY_LOAN = 'STUDY_LOAN',
  EXTERNAL_EVENT = 'EXTERNAL_EVENT',
}

export class CreateBonafideDto {
  @ApiProperty({ enum: BonafidePurposeDtoEnum, description: 'Purpose of Bonafide Certificate' })
  @IsEnum(BonafidePurposeDtoEnum)
  @IsNotEmpty()
  purpose!: BonafidePurposeDtoEnum;

  @ApiProperty({ description: 'Display title for the purpose', example: 'Summer Internship (SIP) Bonafide' })
  @IsString()
  @IsNotEmpty()
  purposeTitle!: string;

  @ApiPropertyOptional({ description: 'Academic Year', example: '2026-27' })
  @IsString()
  @IsOptional()
  academicYear?: string;

  @ApiProperty({ description: 'Purpose-specific dynamic form data' })
  @IsObject()
  @IsNotEmpty()
  formData!: Record<string, any>;

  @ApiPropertyOptional({ description: 'List of supporting document URLs or attachments' })
  @IsArray()
  @IsOptional()
  supportingDocs?: any[];

  @ApiPropertyOptional({ description: 'Save as draft flag', default: false })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}

export class ReviewBonafideDto {
  @ApiProperty({ enum: ['APPROVE', 'REJECT', 'REQUEST_CHANGES', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED'], description: 'Review action' })
  @IsString()
  @IsNotEmpty()
  action!: string;

  @ApiPropertyOptional({ description: 'Reviewer comments or remarks' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Alternative reviewer comments' })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiPropertyOptional({ description: 'Structured rejection category' })
  @IsString()
  @IsOptional()
  rejectionCategory?: string;

  @ApiPropertyOptional({ description: 'Alternative rejection reason category' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'Specific correction instructions for the student' })
  @IsString()
  @IsOptional()
  correctionInstructions?: string;
}

export class ResubmitBonafideDto {
  @ApiProperty({ description: 'Updated purpose-specific form data' })
  @IsObject()
  @IsNotEmpty()
  formData!: Record<string, any>;

  @ApiPropertyOptional({ description: 'Updated supporting document attachments' })
  @IsArray()
  @IsOptional()
  supportingDocs?: any[];

  @ApiPropertyOptional({ description: 'Notes describing what was corrected' })
  @IsString()
  @IsOptional()
  correctionNotes?: string;
}

export class WithdrawBonafideDto {
  @ApiPropertyOptional({ description: 'Reason for withdrawing application' })
  @IsString()
  @IsOptional()
  reason?: string;
}
