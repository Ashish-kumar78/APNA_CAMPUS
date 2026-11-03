import { IsOptional, IsString, IsNumber, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicantDto {
  @ApiPropertyOptional({ example: 'Rahul Kumar Sahoo', description: 'Updated candidate name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'rahul.sahoo@example.com', description: 'Updated personal email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+91 9876543210', description: 'Updated contact phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Male', description: 'Gender identity' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: '2005-03-15', description: 'Date of birth (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  dob?: string;

  @ApiPropertyOptional({ example: 'General', description: 'Category (General, OBC, SC, ST, EWS)' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'O+', description: 'Blood group' })
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiPropertyOptional({ example: 'Section A', description: 'Allocated academic section' })
  @IsString()
  @IsOptional()
  section?: string;

  @ApiPropertyOptional({ example: '26AIML0001', description: 'University/College Roll Number' })
  @IsString()
  @IsOptional()
  rollNumber?: string;

  @ApiPropertyOptional({ example: 88.5, description: 'Class 10th aggregate percentage' })
  @IsNumber()
  @IsOptional()
  tenthMarks?: number;

  @ApiPropertyOptional({ example: 85.0, description: 'Class 12th aggregate percentage' })
  @IsNumber()
  @IsOptional()
  twelfthMarks?: number;

  @ApiPropertyOptional({ example: 'JEE Main', description: 'Competitive entrance examination name' })
  @IsString()
  @IsOptional()
  entranceExam?: string;

  @ApiPropertyOptional({ example: 14250, description: 'All India / State Rank' })
  @IsNumber()
  @IsOptional()
  entranceRank?: number;

  @ApiPropertyOptional({ description: 'Detailed personal info (address, blood group, etc.)' })
  @IsOptional()
  personalDetails?: any;

  @ApiPropertyOptional({ description: 'Detailed parent & guardian info' })
  @IsOptional()
  parentDetails?: any;

  @ApiPropertyOptional({ description: 'Detailed academic background' })
  @IsOptional()
  academicDetails?: any;

  @ApiPropertyOptional({ description: 'Uploaded verification certificates metadata' })
  @IsOptional()
  documents?: any[];
}

