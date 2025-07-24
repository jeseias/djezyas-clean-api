import { Cart } from "@/src/modules/order/domain/entities";
import type { CartRepository } from "@/src/modules/order/domain/repositories/cart-repository";
import type { Id } from "@/src/modules/shared/value-objects";
import { CartModel } from "../models/cart.model";

export class MongooseCartRepository implements CartRepository {
	async save(cart: Cart.Model): Promise<Cart.Model> {
		const existingCart = await CartModel.findOne({ id: cart.id });

		if (existingCart) {
			const updatedCart = await CartModel.findOneAndUpdate(
				{ id: cart.id },
				cart,
				{ new: true },
			);
			return this.mapToDomain(updatedCart!.toObject());
		} else {
			const createdCart = await CartModel.create(cart);
			return this.mapToDomain(createdCart.toObject());
		}
	}

	async findByUserId(userId: Id): Promise<Cart.Model | null> {
		const cart = await CartModel.findOne({ userId }).lean();
		return cart && this.mapToDomain(cart);
	}

	async delete(cart: Cart.Model): Promise<void> {
		await CartModel.deleteOne({ id: cart.id });
	}

	private mapToDomain(cartDoc: any): Cart.Entity {
		return Cart.Entity.fromModel({
			id: cartDoc.id,
			userId: cartDoc.userId,
			items: cartDoc.items,
			createdAt: cartDoc.createdAt,
			updatedAt: cartDoc.updatedAt,
		});
	}
}
