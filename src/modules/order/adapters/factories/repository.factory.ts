import type { OrderRepository } from "../../domain/repositories/order-repository";
import { MongooseOrderRepository } from "../db/mongoose/repositories/order-repository";

export const orderMongooseRepository: OrderRepository =
	new MongooseOrderRepository();
