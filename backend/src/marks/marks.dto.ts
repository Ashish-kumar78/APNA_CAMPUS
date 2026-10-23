import { IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export const ASSESSMENT_FIELDS = [
  'modular1', 'modular2',
  'quiz1', 'quiz2', 'quiz3', 'quiz4', 'quiz5', 'quiz6',
  'assignment1', 'assignment2',
  'surpriseTest1', 'surpriseTest2',
  'labWork',
] as const;

export class UpdateMarkDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  studentId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  rollNumber?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  subjectCode!: string;

  @IsIn(ASSESSMENT_FIELDS)
  assessment!: typeof ASSESSMENT_FIELDS[number];

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(100)
  score!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class SubmitMarksDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  subjectCode!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  semester!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  section!: string;
}

export class MarkQueueActionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  id!: string;
}

export class RejectMarkQueueDto extends MarkQueueActionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  rejectionReason!: string;
}

export class UnlockMarkQueueDto extends MarkQueueActionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
