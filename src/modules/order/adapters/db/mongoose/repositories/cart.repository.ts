import { Cart } from "@/src/modules/order/domain/entities";
import type { CartRepository } from "@/src/modules/order/domain/repositories/cart-repository";
import type { Id } from "@/src/modules/shared/value-objects";
import { CartModel } from "../cart.model";

export class MongooseCartRepository implements CartRepository {
	async findById(id: Id): Promise<Cart.Entity | null> {
		const cart = await CartModel.findById(id).lean();
		return cart && this.mapToDomain(cart)
	}

	async create(cart: Cart.Entity): Promise<Cart.Entity> {
		const createdCart = await CartModel.create(cart);
		return this.mapToDomain(createdCart.toObject());
	}

	async update(data: Partial<Cart.Model>): Promise<Cart.Entity> {
		if (!data.id) {
			throw new Error("Cart ID is required for update");
		}
		const updatedCart = await CartModel.findByIdAndUpdate(data.id, data, {
			new: true,
			runValidators: true,
		}).lean();
		if (!updatedCart) {
			throw new Error("Cart not found");
		}
		return this.mapToDomain(updatedCart);
	}

	async delete(id: Id): Promise<void> {
		const result = await CartModel.findByIdAndDelete(id);
		if (!result) {
			throw new Error("Cart not found");
		}
	}

	async findByUserId(userId: Id): Promise<Cart.Entity | null> {
		const cart = await CartModel.findOne({ userId }).lean();
		return cart && this.mapToDomain(cart);
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
