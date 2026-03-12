import { HttpCode, HttpStatus, Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma.service';
import { Order } from 'generated/prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PaginationDto } from 'src/common';
import { StatusDto } from './dto/status.dto';
import { Or } from '@prisma/client/runtime/client';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { NATS_SERVICE, PRODUCTS_SERVICE } from 'src/config';
import { catchError, first, firstValueFrom } from 'rxjs';
import { OrderWithProducts } from './interfaces/order-with-products.interface';

@Injectable()
export class OrdersService{

  constructor(
    private readonly prisma: PrismaService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ){}


  async create(createOrderDto: CreateOrderDto) {
    const ids = createOrderDto.items.map(item => item.productId);
    const products: any[] = await firstValueFrom(this.client.send({cmd: "validate_products"}, ids).pipe(
      catchError(error=>{
        throw new RpcException(error)
      })
    ));

    const totalAmount = createOrderDto.items.reduce((acc, orderItem)=>{
      const price = products.find(product => product.id === orderItem.productId).price
      return acc + price * orderItem.quantity
    }, 0)

    const totalItems = createOrderDto.items.reduce((acc, orderItem)=>{
      return acc + orderItem.quantity
    }, 0)

    const order = await this.prisma.order.create({
      data: {
        totalAmount,
        totalItems,
        OrderItem: {
          createMany: {
            data: createOrderDto.items.map(orderItem => ({
              price: products.find(product=>product.id === orderItem.productId).price,
              productId: orderItem.productId,
              quantity: orderItem.quantity
            }))
          }
        }
      },
      include: {
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true
          }
        }
      }
    })

    return {
      ... order,
      OrderItem: order.OrderItem.map(item=>({
        ...item,
        name: products.find(product=>product.id === item.productId).name
      }))
    }
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

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({where: {id}, include:{OrderItem: {
      select: {
        price: true,
        quantity: true,
        productId: true
      }
    }}})
    if(!order) throw new RpcException({status: HttpStatus.NOT_FOUND, message: 'Order not found'});

    const productsIds = order.OrderItem.map(item => item.productId);
    const products: any[] = await firstValueFrom(
      this.client.send({cmd: "validate_products"}, productsIds).pipe(
        catchError(error=>{
          throw new RpcException(error)
        })
      )
    );

    return {
      ...order,
      OrderItem: order.OrderItem.map(item=>({
        ...item,
        name: products.find(product=>product.id === item.productId).name
      }))
    }
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

  async createPaymentSession(order: OrderWithProducts) {
    const paymentSession = await firstValueFrom(
      this.client.send("create.payment.session", {
        items: order.OrderItem.map(item=>({name: item.name, price: item.price, quantity: item.quantity})),
        currency: "usd",
        orderId: order.id
      }).pipe(
        catchError(error=>{
          throw new RpcException(error)
        })
      )
    )

    return paymentSession
  }
}
