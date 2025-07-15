import type { CartRepository } from "../../domain/repositories";
import type { OrderRepository } from "../../domain/repositories/order-repository";
import { MongooseCartRepository } from "../db/mongoose/repositories/cart.repository";
import { MongooseOrderRepository } from "../db/mongoose/repositories/order-repository";

export const orderMongooseRepository: OrderRepository =
	new MongooseOrderRepository();
export const cartMongooseRepository: CartRepository =
	new MongooseCartRepository();
