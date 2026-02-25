import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive } from "class-validator";

export class PaginationDto{
    @IsPositive()
    @IsInt()
    @IsOptional()
    @Type(()=>Number)
    page: number = 1;

    @IsPositive()
    @IsInt()
    @IsOptional()
    @Type(()=>Number)
    limit: number = 10
}