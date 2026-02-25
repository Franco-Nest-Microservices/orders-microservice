import { IsEnum, IsOptional } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";
import { OrderStatus } from "@prisma/client";

export class StatusDto {
    @IsOptional()
    @IsEnum(OrderStatusList, {
        message: `Possible status values are ${OrderStatusList.join(', ')}`
    })
    status: OrderStatus
}