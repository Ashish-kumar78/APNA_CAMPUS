import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IssueIdCardDto {
  @ApiProperty({ description: 'Student Registration Number or Database ID', example: '2401432265' })
  @IsString()
  @IsNotEmpty()
  studentIdentifier!: string;

  @ApiPropertyOptional({ description: 'Internship Host Organization', example: 'Central Tool Room and Training Center' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ description: 'Internship Designation / Track', example: 'Industrial Trainee / Intern' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ description: 'Academic Session', example: '2026-2027 (SIP)' })
  @IsString()
  @IsOptional()
  academicSession?: string;

  @ApiPropertyOptional({ description: 'Card Expiry Date', example: '2027-06-30' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Optional Student Contact Phone Override', example: '7735994528' })
  @IsString()
  @IsOptional()
  mobile?: string;

  @ApiPropertyOptional({ description: 'Optional Student Course Override' })
  @IsString()
  @IsOptional()
  course?: string;

  @ApiPropertyOptional({ description: 'Optional Student Batch Override' })
  @IsString()
  @IsOptional()
  batch?: string;
}

export class PreviewIdCardDto {
  @ApiProperty({ description: 'Student Registration Number or ID', example: '2401432265' })
  @IsString()
  @IsNotEmpty()
  studentIdentifier!: string;

  @ApiPropertyOptional({ description: 'Company name', example: 'Central Tool Room and Training Center' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ description: 'Session', example: '2026-2027 (SIP)' })
  @IsString()
  @IsOptional()
  academicSession?: string;
}
