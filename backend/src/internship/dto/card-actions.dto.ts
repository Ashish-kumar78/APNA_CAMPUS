import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReissueIdCardDto {
  @ApiProperty({ description: 'Reason for card reissue', example: 'Original card lost / damaged' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({ description: 'New Card Expiry Date (optional)' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}

export class RenewIdCardDto {
  @ApiProperty({ description: 'New Expiry Date for Card Extension', example: '2027-12-31' })
  @IsDateString()
  @IsNotEmpty()
  expiryDate!: string;

  @ApiPropertyOptional({ description: 'Reason or notes for extension', example: 'Internship duration extended by employer' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class RevokeIdCardDto {
  @ApiProperty({ description: 'Reason for card revocation', example: 'Student withdrew from internship program' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
