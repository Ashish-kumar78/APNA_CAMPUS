import { Equals, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  studentId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  rollNumber!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  department!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  deptCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  semester?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  section?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  academicYear?: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  phone?: string;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  deptCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  semester?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  section?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  academicYear?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;
}

export class TransferPreferenceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  campus!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  city!: string;

  @Equals(true)
  confirmed!: boolean;
}
