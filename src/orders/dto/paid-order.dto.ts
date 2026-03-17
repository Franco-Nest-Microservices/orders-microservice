import { IsString, IsUrl, IsUUID } from "class-validator"

export class PaidOrderDto {
    @IsString()
    @IsUUID()
    orderId: string
    @IsString()
    strypePaymentId: string
    @IsString()
    @IsUrl()
    receiptUrl: string
}