import { IsString, MaxLength, MinLength } from 'class-validator';

export class ActivateAccountDto {
  @IsString()
  @MinLength(32)
  @MaxLength(256)
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword!: string;
}

export class ForgotPasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(254)
  identifier!: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(32)
  @MaxLength(256)
  resetToken!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword!: string;
}
