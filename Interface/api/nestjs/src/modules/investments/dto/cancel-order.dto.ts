import { IsInt, Min } from 'class-validator';

export class CancelOrderDto {
  @IsInt()
  @Min(1)
  orderId: number;
}
