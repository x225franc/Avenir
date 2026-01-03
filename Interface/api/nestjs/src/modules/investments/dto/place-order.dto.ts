import { IsString, IsNotEmpty, IsInt, IsEnum, Min } from 'class-validator';

export enum OrderTypeDto {
  BUY = 'buy',
  SELL = 'sell',
}

export class PlaceOrderDto {
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsInt()
  @Min(1)
  stockId: number;

  @IsEnum(OrderTypeDto)
  orderType: OrderTypeDto;

  @IsInt()
  @Min(1)
  quantity: number;
}
