import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'rakesh2026@campus.edu.in',
    description: 'Registered institutional email address or student roll number / college ID',
  })
  @IsString()
  @IsNotEmpty()
  identifier!: string;
}

