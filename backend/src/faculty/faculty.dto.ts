import {
  IsObject,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SubmitAttendanceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  subjectCode!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  section!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  period!: string;

  @IsObject()
  attendanceMap!: Record<string, boolean>;
}
