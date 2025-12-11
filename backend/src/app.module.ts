import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { BacktestModule } from './modules/backtest/backtest.module';
import { StrategyModule } from './modules/strategy/strategy.module';
import { TradeModule } from './modules/trade/trade.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotebookModule } from './modules/notebook/notebook.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt.guard';

@Module({
  imports: [
    AuthModule,
    HealthModule,
    BacktestModule,
    StrategyModule,
    TradeModule,
    ReportsModule,
    NotebookModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

