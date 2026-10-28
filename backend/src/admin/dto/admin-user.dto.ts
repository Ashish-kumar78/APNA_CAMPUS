import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminUserDto {
  @ApiPropertyOptional({ description: 'Institutional unique identifier / Employee ID / Roll Number', example: 'EMP-ADM-01' })
  @IsString()
  @IsOptional()
  identifier?: string;

  @ApiProperty({ description: 'Full name of user', example: 'Dr. Anita Mohanty' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Official email address', example: 'anita.m@apnacampus.edu.in' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Institutional role enum', example: 'FACULTY' })
  @IsString()
  @IsNotEmpty()
  role!: string;

  @ApiPropertyOptional({ description: 'Department assignment', example: 'Computer Science & Engineering' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'Initial default password', example: 'gift123' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ description: 'Official designation', example: 'Associate Professor' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ description: 'Contact phone number', example: '+91 94370 12345' })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateAdminUserStatusDto {
  @ApiPropertyOptional({ description: 'Active lifecycle state (true = Active, false = Suspended/Inactive)', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'String status representation (Active, Suspended, Inactive)', example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;
}
