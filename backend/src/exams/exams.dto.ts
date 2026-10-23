import { IsISO8601, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export const EXAM_CYCLE_STATUSES = [
  'Draft',
  'Registration Open',
  'Registration Closed',
  'Scheduling',
  'Admit Cards Ready',
  'In Progress',
  'Evaluation',
  'Moderation',
  'Results Approval',
  'Published',
  'Closed',
] as const;

export class CreateExamCycleDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(80)
  session!: string;

  @IsISO8601({ strict: true })
  startDate!: string;

  @IsISO8601({ strict: true })
  endDate!: string;
}

export class TransitionExamCycleDto {
  @IsString()
  @IsIn(EXAM_CYCLE_STATUSES)
  status!: string;
}
