import { Module } from '@nestjs/common';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { BROKER_ADAPTER } from './adapters/broker.adapter';
import { MockBrokerAdapter } from './adapters/mock-broker.adapter';

@Module({
  controllers: [TradeController],
  providers: [
    TradeService,
    {
      provide: BROKER_ADAPTER,
      useClass: MockBrokerAdapter,
    },
  ],
})
export class TradeModule {}

