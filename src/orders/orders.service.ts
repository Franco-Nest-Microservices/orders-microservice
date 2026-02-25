import { HttpCode, HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma.service';
import { Order } from 'generated/prisma/client';
import { RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PaginationDto } from 'src/common';
import { OrderStatus } from '@prisma/client';
import { StatusDto } from './dto/status.dto';
import { Or } from '@prisma/client/runtime/client';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';

@Injectable()
export class OrdersService{

  constructor(
    private readonly prisma: PrismaService
  ){}


  create(createOrderDto: CreateOrderDto) {
    return {
      service: "Orders Microservice",
      createOrderDto: createOrderDto
    }
    //return this.prisma.order.create({data: createOrderDto});
  }

  async findAll(paginationDto: OrderPaginationDto) {
    const orders = await this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      where:{
        status: paginationDto.status
      },
      skip: (paginationDto.page - 1) * paginationDto.limit,
      take: paginationDto.limit
    });
    const total = await this.prisma.order.count({where: {status: paginationDto.status}});
    return {data: orders, meta: {total, page: paginationDto.page, totalPages: Math.ceil(total / paginationDto.limit)}};
  }

  async findAllByStatus(paginationDto: PaginationDto, statusDto: StatusDto) {
    
    const orders = await this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      where:{
        status: statusDto.status
      },
      skip: (paginationDto.page - 1) * paginationDto.limit,
      take: paginationDto.limit
    });
    const total = await this.prisma.order.count({where:{status: statusDto.status}});
    return {data: orders, meta: {total, page: paginationDto.page, totalPages: Math.ceil(total / paginationDto.limit)}};
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({where: {id}})
    if(!order) throw new RpcException({status: HttpStatus.NOT_FOUND, message: 'Order not found'});
    return order;
  }

  async changeOrderStatus(changeOrderStatusDto :ChangeOrderStatusDto) {
    
    const {id, status} = changeOrderStatusDto
    const order = await this.findOne(id);
    if(order.status == status){
      return order
    }
    
    return this.prisma.order.update({
      where: {id},
      data: {
        status
      }
    })
  }
}
