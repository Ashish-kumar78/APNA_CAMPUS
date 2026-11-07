import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCalendarNoteDto {
  @ApiProperty({ description: 'Title of the calendar note' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Description or task reminder details' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Scheduled date in YYYY-MM-DD format' })
  @IsNotEmpty()
  @IsString()
  scheduledDate!: string;

  @ApiPropertyOptional({ description: 'Start time in HH:mm format' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time in HH:mm format' })
  @IsOptional()
  @IsString()
  endTime?: string;
}

export class UpdateCalendarNoteDto {
  @ApiPropertyOptional({ description: 'Title of the calendar note' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Description or task reminder details' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Scheduled date in YYYY-MM-DD format' })
  @IsOptional()
  @IsString()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Start time in HH:mm format' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time in HH:mm format' })
  @IsOptional()
  @IsString()
  endTime?: string;
}
