import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RejectApplicantDto {
  @ApiProperty({ example: 'Did not meet the minimum PCM aggregate requirement of 60%.', description: 'Institutional reason for application rejection' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({ example: 'Candidate advised to apply under general science stream.', description: 'Internal staff notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

