import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBacktestDto {
  @IsString()
  strategyId!: string;

  @IsString()
  code!: string;

  @IsString()
  benchmark!: string;

  @IsString()
  startDate!: string; // YYYYMMDD

  @IsString()
  endDate!: string; // YYYYMMDD

  @IsOptional()
  @IsNumber()
  cash?: number;

  @IsOptional()
  @IsNumber()
  slippage?: number;

  @IsOptional()
  @IsNumber()
  commission?: number;
}

