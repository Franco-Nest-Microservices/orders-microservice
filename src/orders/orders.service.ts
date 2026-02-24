import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma.service';
import { Order } from 'generated/prisma/client';

@Injectable()
export class OrdersService{

  constructor(
    private readonly prisma: PrismaService
  ){}


  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  async findAll() {
    const orders = await this.prisma.order.findFirst();
    return {orders: orders};
  }

  findOne(id: number): Promise<Order | null> {
    return this.prisma.order.findFirst();
  }

  changeOrderStatus(id: number, status: string) {
    return `This action changes the status of order #${id} to ${status}`;
  }
}
