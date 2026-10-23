import { IsString, MaxLength, MinLength } from 'class-validator';

export class HodQueueActionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  id!: string;
}

export class HodRejectMarksDto extends HodQueueActionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  rejectionReason!: string;
}

export class HodUnlockMarksDto extends HodQueueActionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
