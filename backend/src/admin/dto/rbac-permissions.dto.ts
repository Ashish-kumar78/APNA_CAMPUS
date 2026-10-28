import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SaveRbacPermissionsDto {
  @ApiPropertyOptional({ description: 'Role identifier key', example: 'super_admin' })
  @IsString()
  @IsOptional()
  roleKey?: string;

  @ApiPropertyOptional({ description: 'Granted permission keys array or role matrix mapping', example: ['manage_users', 'view_audit_trail'] })
  @IsOptional()
  permissions?: any;
}
