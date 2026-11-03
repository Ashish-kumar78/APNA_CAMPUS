import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateAccountDto {
  @ApiProperty({
    example: 'd9f28c5a-731b-4f9e-bc41-2a94fb21980e',
    description: 'Unique student account activation token generated during admission enrollment',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: 'StudentSecurePass2026!',
    description: 'Permanent login password for the student (minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}

