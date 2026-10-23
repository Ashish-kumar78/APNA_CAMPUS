import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  MaxLength,
  Matches,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateFoodItemDto {
  @IsString() @MinLength(2) name!: string;
  @IsString() @MinLength(2) category!: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) price!: number;
  @IsString() prepTime!: string;
  @IsString() calories!: string;
}

export class OrderLineDto {
  @IsString() itemId!: string;
  @Type(() => Number) @IsInt() @Min(1) quantity!: number;
}

export class PlaceOrderDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderLineDto)
  items!: OrderLineDto[];
}

export class UpdateOrderStatusDto {
  @IsString() @IsIn(['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'])
  status!: string;
}

export class WalletTopUpDto {
  @IsString() rollNumber!: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) amount!: number;
  @IsString() @MinLength(6) @MaxLength(120) @Matches(/^[A-Za-z0-9._:-]+$/)
  reference!: string;
}
