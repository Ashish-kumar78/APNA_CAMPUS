import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicantDto {
  @ApiProperty({ example: 'Rahul Sahoo', description: 'Full candidate name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'rahul.sahoo@example.com', description: 'Personal email address for communication' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '+91 9876543210', description: 'Primary contact phone number' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'cmvtf98760000abc12345678', description: 'Selected academic Programme ID from database' })
  @IsString()
  @IsNotEmpty()
  programmeId!: string;

  @ApiPropertyOptional({ example: 'Bachelor of Technology in Computer Science & Engineering', description: 'Programme title' })
  @IsString()
  @IsOptional()
  programmeName?: string;

  @ApiPropertyOptional({ example: '2026-27', description: 'Target academic session year' })
  @IsString()
  @IsOptional()
  academicYear?: string;

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

  @ApiPropertyOptional({ example: [], description: 'Uploaded verification certificates metadata' })
  @IsOptional()
  documents?: any[];

  @ApiPropertyOptional({ description: 'Detailed personal info' })
  @IsOptional()
  personalDetails?: any;

  @ApiPropertyOptional({ description: 'Detailed parent & guardian info' })
  @IsOptional()
  parentDetails?: any;

  @ApiPropertyOptional({ description: 'Detailed academic background' })
  @IsOptional()
  academicDetails?: any;

  @ApiPropertyOptional({ example: true, description: 'Directly enroll student and generate login credentials' })
  @IsOptional()
  directEnroll?: boolean;

  @ApiPropertyOptional({ example: 'Student@2026', description: 'Initial login password for student portal' })
  @IsString()
  @IsOptional()
  initialPassword?: string;
}

