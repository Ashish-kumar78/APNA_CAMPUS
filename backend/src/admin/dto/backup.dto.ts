import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RestoreBackupDto {
  @ApiPropertyOptional({ description: 'Mandatory confirmation safety token (RESTORE-CONFIRM)', example: 'RESTORE-CONFIRM' })
  @IsString()
  @IsOptional()
  confirmationCode?: string;

  @ApiPropertyOptional({ description: 'Confirmation code alias', example: 'RESTORE-CONFIRM' })
  @IsString()
  @IsOptional()
  confirmation?: string;
}
