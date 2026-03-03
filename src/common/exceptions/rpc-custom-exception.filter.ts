import { ArgumentsHost, Catch, RpcExceptionFilter } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { isNumber } from "class-validator";

interface RpcErrorFormat {
  status: number | string
  message: string
}

function isRpcErrorFormat(error: any): error is RpcErrorFormat {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error
  )
}
@Catch(RpcException)
export class RpcCustomExceptionFilter implements RpcExceptionFilter<RpcException> {
    catch(exception: RpcException, host: ArgumentsHost){
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()

        const rpcError = exception.getError()
        
        // If the rpcError does contain the expected properties, we can directly use it as the response.
        if(isRpcErrorFormat(rpcError)) {        
            const status = typeof rpcError.status === "number" ? rpcError.status : 400
            return response.status(status).json({status, message: rpcError.message})
        } 

        // If the rpcError does not contain the expected properties, we can return a default error response.
        response.status(400).json({
            status: 400,
            message: rpcError
        })
    }
}