import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIncidentDto {
  @ApiProperty({ description: 'Incident status (open, investigating, resolved, closed)', example: 'resolved' })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiPropertyOptional({ description: 'Investigation notes and resolution remarks', example: 'Investigation completed. Threat mitigated.' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Resolution notes alias', example: 'Investigation completed. Threat mitigated.' })
  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}

export class CreateIncidentDto {
  @ApiProperty({ description: 'Incident summary title', example: 'Brute-force credential attempt detected' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Category', example: 'Authentication Brute-Force' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Severity level (low, medium, high, critical)', example: 'high' })
  @IsString()
  @IsOptional()
  severity?: string;

  @ApiPropertyOptional({ description: 'Account affected', example: 'FAC-CSE-019' })
  @IsString()
  @IsOptional()
  affectedAccount?: string;

  @ApiPropertyOptional({ description: 'Description or details', example: 'Suspicious activity detected' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Source reporting tool or system', example: 'firewall' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ description: 'Source IP address', example: '192.168.1.142' })
  @IsString()
  @IsOptional()
  sourceIp?: string;

  @ApiPropertyOptional({ description: 'Cryptographic or forensic evidence snippet' })
  @IsString()
  @IsOptional()
  evidence?: string;

  @ApiPropertyOptional({ description: 'Assigned investigator or role', example: 'Chief Systems Architect' })
  @IsString()
  @IsOptional()
  assignedTo?: string;
}
