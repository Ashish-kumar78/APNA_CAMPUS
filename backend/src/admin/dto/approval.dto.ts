import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DecideApprovalDto {
  @ApiProperty({ description: 'Decision outcome', enum: ['APPROVED', 'REJECTED', 'approved', 'rejected'], example: 'APPROVED' })
  @IsString()
  @IsIn(['APPROVED', 'REJECTED', 'approved', 'rejected'])
  decision!: string;

  @ApiPropertyOptional({ description: 'Mandatory decision justification note (min 5 chars)', example: 'Endorsed by Dean Academics and Exam Cell.' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Alias for reason used by frontend', example: 'Endorsed by Dean Academics and Exam Cell.' })
  @IsString()
  @IsOptional()
  justification?: string;
}
