import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SaveSettingsDto {
  @ApiPropertyOptional({ description: 'Configuration category', example: 'General' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Dictionary of configuration keys and values' })
  @IsOptional()
  settings?: Record<string, any>;

  [key: string]: any;
}
