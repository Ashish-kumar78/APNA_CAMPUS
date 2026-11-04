import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveApplicantDto {
  @ApiPropertyOptional({ example: 'General Merit', description: 'Admission quota category (General, Sports, NRI, Defense)' })
  @IsString()
  @IsOptional()
  quotaCategory?: string;

  @ApiPropertyOptional({ example: '2026-27', description: 'Academic year session' })
  @IsString()
  @IsOptional()
  academicYear?: string;

  @ApiPropertyOptional({ example: 'Student@2026', description: 'Initial login password to generate for student portal' })
  @IsString()
  @IsOptional()
  password?: string;
}

