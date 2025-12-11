import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class PlaceOrderDto {
  @IsString()
  symbol!: string;

  @IsIn(['buy', 'sell'])
  side!: 'buy' | 'sell';

  @IsIn(['market', 'limit'])
  type!: 'market' | 'limit';

  @IsNumber()
  qty!: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  accountId?: string;
}

