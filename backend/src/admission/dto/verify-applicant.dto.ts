import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyApplicantDto {
  @ApiPropertyOptional({ example: true, description: 'Whether document certificates have been verified' })
  @IsBoolean()
  @IsOptional()
  documentsVerified?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Whether minimum academic eligibility is cleared' })
  @IsBoolean()
  @IsOptional()
  academicClearance?: boolean;

  @ApiPropertyOptional({ example: 'All Class 10/12 original marks verified against DigiLocker portal.', description: 'Officer scrutiny remarks' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

