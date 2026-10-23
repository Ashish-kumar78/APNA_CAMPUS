import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateApplicantDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(7)
  @MaxLength(30)
  @Matches(/^(?=.*\d)\+?[0-9\s().-]{7,30}$/)
  phone!: string;

  @IsString()
  @MaxLength(40)
  @MinLength(1)
  gender!: string;

  @IsDateString()
  dob!: string;

  @IsString()
  @MaxLength(40)
  @MinLength(1)
  category!: string;

  @IsString()
  @MinLength(1)
  programmeId!: string;

  @IsString()
  @Matches(/^\d{4}-(?:\d{2}|\d{4})$/)
  academicYear!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  tenthMarks?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  twelfthMarks?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  entranceExam?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  entranceRank?: number;

}

export class RejectApplicantDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason!: string;
}
