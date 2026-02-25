import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "generated/prisma/client";
import "dotenv/config";
import { configDotenv } from "dotenv";

configDotenv()
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit{

  private readonly logger = new Logger("Prisma Service");
  constructor(){
    const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
    super({adapter});
  }

  async onModuleInit() {
  try {
    await this.$connect();
    this.logger.log('Connected to database');
  } catch (error) {
    this.logger.error('Error connecting to database', error);
  }
}
  
}
