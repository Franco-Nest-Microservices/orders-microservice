import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma.module';
import { NatsModule } from './transports/nats.module';

@Module({
  imports: [PrismaModule, OrdersModule, NatsModule],
})
export class AppModule {}
