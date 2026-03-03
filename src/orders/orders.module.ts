import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config';

@Module({
  imports: [ClientsModule.register([
    {
      name: "PRODUCTS_SERVICE", transport: Transport.TCP, options: {
        host: envs.PRODUCTS_MS_HOST,
        port: envs.PRODUCTS_MS_PORT
      }
    }
  ])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
