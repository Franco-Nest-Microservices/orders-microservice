import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PaginationDto } from 'src/common';
import { StatusDto } from './dto/status.dto';
import { OrderStatus } from '@prisma/client';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern('findAllOrders')
  findAllById(@Payload() pagination: OrderPaginationDto) {
    return this.ordersService.findAll(pagination);
  }

  @MessagePattern('findAllOrdersByStatus')
  findAllByStatus(@Payload() {paginationDto, statusDto}: {paginationDto: PaginationDto, statusDto: StatusDto}) {
    return this.ordersService.findAllByStatus(paginationDto, statusDto);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload() payload: { id: string}) {
    return this.ordersService.findOne(payload.id);
  }
  
  @MessagePattern("changeOrderStatus")
  changeOrderStatus(@Payload() changeOrderStatusDto: ChangeOrderStatusDto) {
    return this.ordersService.changeOrderStatus(changeOrderStatusDto);
  }
}
