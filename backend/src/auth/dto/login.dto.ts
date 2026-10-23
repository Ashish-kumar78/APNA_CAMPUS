import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '2305201001', description: 'Registration number, College ID, or email' })
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  @ApiProperty({ example: 'Your account password', description: 'User account password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(72)
  password!: string;
}
