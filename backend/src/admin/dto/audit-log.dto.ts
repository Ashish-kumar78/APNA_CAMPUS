import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiPropertyOptional({ description: 'Acting user identifier or name', example: 'Super Administrator' })
  @IsString()
  @IsOptional()
  user?: string;

  @ApiPropertyOptional({ description: 'Institutional role of actor', example: 'SUPER_ADMIN' })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({ description: 'Action performed', example: 'User Account Suspended' })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiPropertyOptional({ description: 'Target resource or account', example: 'User: STU-2024-001' })
  @IsString()
  @IsOptional()
  target?: string;

  @ApiPropertyOptional({ description: 'Previous state before change', example: 'Active' })
  @IsString()
  @IsOptional()
  oldValue?: string;

  @ApiPropertyOptional({ description: 'New state after change', example: 'Suspended' })
  @IsString()
  @IsOptional()
  newValue?: string;

  @ApiPropertyOptional({ description: 'Client IP address', example: '192.168.1.10' })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Outcome status (Success, Failed, Denied)', example: 'Success' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Target student roll/name if academic mark moderation', example: 'Rohan Sahoo' })
  @IsString()
  @IsOptional()
  targetStudent?: string;

  @ApiPropertyOptional({ description: 'Course or curriculum subject', example: 'Operating Systems (CS-501)' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ description: 'Administrative or academic department', example: 'Computer Science & Engineering' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'Functional campus module', example: 'Examination & Marks' })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiPropertyOptional({ description: 'Detailed justification or context' })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiPropertyOptional({ description: 'Audit reasoning or explanation' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Assessment or examination type' })
  @IsString()
  @IsOptional()
  assessment?: string;

  @ApiPropertyOptional({ description: 'Old mark alias' })
  @IsString()
  @IsOptional()
  oldMark?: string;

  @ApiPropertyOptional({ description: 'New mark alias' })
  @IsString()
  @IsOptional()
  newMark?: string;
}
