import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFacultyDto {
  @ApiProperty({ description: 'Faculty full name', example: 'Dr. Anita Mohanty' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Official email address', example: 'anita.m@apnacampus.edu.in' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ description: 'Contact phone', example: '+91 98611 00000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Department', example: 'Computer Science & Engineering' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'Designation', example: 'Assistant Professor' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ description: 'Assigned subjects list or comma-separated string', example: ['Data Structures', 'Database Systems'] })
  @IsOptional()
  assignedSubjects?: string[] | string;

  @ApiPropertyOptional({ description: 'Assigned class sections', example: ['Sem 5 - Sec A'] })
  @IsOptional()
  assignedSections?: string[] | string;

  @ApiPropertyOptional({ description: 'Status (Active, On Leave, Resigned)', example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Employee ID', example: 'FAC-101' })
  @IsString()
  @IsOptional()
  employeeId?: string;
}

export class UpdateFacultyDto {
  @ApiPropertyOptional({ description: 'Faculty full name', example: 'Dr. Anita Mohanty' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Official email address', example: 'anita.m@apnacampus.edu.in' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Contact phone', example: '+91 98611 00000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Department', example: 'Computer Science & Engineering' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'Designation', example: 'Assistant Professor' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ description: 'Assigned subjects list', example: ['Data Structures'] })
  @IsOptional()
  assignedSubjects?: string[] | string;

  @ApiPropertyOptional({ description: 'Assigned class sections', example: ['Sem 5 - Sec A'] })
  @IsOptional()
  assignedSections?: string[] | string;

  @ApiPropertyOptional({ description: 'Status', example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateHodDto {
  @ApiProperty({ description: 'HOD full name', example: 'Dr. P. K. Pattnaik' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Official email address', example: 'hod.cse@apnacampus.edu.in' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ description: 'Contact phone', example: '+91 94371 00000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Department name', example: 'Computer Science & Engineering' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'Department short code', example: 'CSE' })
  @IsString()
  @IsOptional()
  deptCode?: string;

  @ApiPropertyOptional({ description: 'Academic experience', example: '15 Years' })
  @IsString()
  @IsOptional()
  experience?: string;

  @ApiPropertyOptional({ description: 'Highest academic qualification', example: 'Ph.D in Computer Science' })
  @IsString()
  @IsOptional()
  qualification?: string;

  @ApiPropertyOptional({ description: 'Employee ID', example: 'HOD-CSE-01' })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateHodDto {
  @ApiPropertyOptional({ description: 'HOD full name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Official email address' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Department name' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'Department short code' })
  @IsString()
  @IsOptional()
  deptCode?: string;

  @ApiPropertyOptional({ description: 'Academic experience' })
  @IsString()
  @IsOptional()
  experience?: string;

  @ApiPropertyOptional({ description: 'Highest qualification' })
  @IsString()
  @IsOptional()
  qualification?: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateMarkingSchemeDto {
  @ApiPropertyOptional({ description: 'Assessment type label', example: 'Mid-Term Exam' })
  @IsString()
  @IsOptional()
  assessmentType?: string;

  @ApiPropertyOptional({ description: 'Count of evaluations', example: 2 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  count?: number;

  @ApiPropertyOptional({ description: 'Maximum marks per test', example: 20 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxMarks?: number;

  @ApiPropertyOptional({ description: 'Weightage in final continuous evaluation percentage', example: 20 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weightage?: number;

  @ApiPropertyOptional({ description: 'Formula rule', example: 'Average of Best 2' })
  @IsString()
  @IsOptional()
  formula?: string;

  @ApiPropertyOptional({ description: 'Status (Active / Inactive)', example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;
}
