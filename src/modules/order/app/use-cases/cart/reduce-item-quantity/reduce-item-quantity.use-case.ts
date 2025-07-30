import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { tryCatchSync } from "@/src/modules/shared/utils";
import type { Id } from "@/src/modules/shared/value-objects";
import { Cart } from "../../../../domain/entities";
import type { CartRepository } from "../../../../domain/repositories/cart-repository";

export namespace ReduceItemQuantity {
	export type Params = {
		userId: string;
		productId: string;
	};

	export type Result = {
		id: Id;
		itemCount: number;
		itemRemoved: boolean;
	};
}

export class ReduceItemQuantityUseCase {
	constructor(private readonly cartRepository: CartRepository) {}

	async execute(
		params: ReduceItemQuantity.Params,
	): Promise<ReduceItemQuantity.Result> {
		const cartModel = await this.cartRepository.findByUserId(params.userId);
		if (!cartModel) {
			throw new AppError("Cart not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		const cartEntity = Cart.Entity.fromModel(cartModel);

		// Find the item in the cart
		const item = cartEntity.items.find(
			(item) => item.productId === params.productId,
		);

		if (!item) {
			throw new AppError(
				"Item not found in cart",
				404,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		// If quantity is 1, remove the item entirely
		if (item.quantity === 1) {
			const updatedCartEntity = tryCatchSync(
				() => cartEntity.removeItem(params.productId as Id),
				"Failed to remove item from cart",
				ErrorCode.INVALID_OPERATION,
				400,
			);

			const updatedCart = await this.cartRepository.save(
				updatedCartEntity.getSnapshot(),
			);

			return {
				id: updatedCart.id,
				itemCount: updatedCart.items.length,
				itemRemoved: true,
			};
		} else {
			// Reduce quantity by 1
			const newQuantity = item.quantity - 1;
			const updatedCartEntity = tryCatchSync(
				() => cartEntity.updateItem(params.productId as Id, newQuantity),
				"Failed to update item quantity",
				ErrorCode.INVALID_OPERATION,
				400,
			);

			const updatedCart = await this.cartRepository.save(
				updatedCartEntity.getSnapshot(),
			);

			return {
				id: updatedCart.id,
				itemCount: updatedCart.items.length,
				itemRemoved: false,
			};
		}
	}
}
