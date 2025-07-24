import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { Id } from "@/src/modules/shared/value-objects";
import { Cart } from "../../../../domain/entities";
import type { CartRepository } from "../../../../domain/repositories/cart-repository";

export namespace RemoveItemFromCart {
	export type Params = {
		userId: string;
		productId: string;
	};

	export type Result = {
		id: Id;
		itemCount: number;
	};
}

export class RemoveItemFromCartUseCase {
	constructor(private readonly cartRepository: CartRepository) {}

	async execute(
		params: RemoveItemFromCart.Params,
	): Promise<RemoveItemFromCart.Result> {
		const cartModel = await this.cartRepository.findByUserId(params.userId);
		if (!cartModel) {
			throw new AppError("Cart not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		const cartEntity = Cart.Entity.fromModel(cartModel);

		const itemExists = cartEntity.items.some(
			(item) => item.productId === params.productId,
		);
		if (!itemExists) {
			throw new AppError(
				"Item not found in cart",
				404,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		cartEntity.removeItem(params.productId as Id);

		const updatedCart = await this.cartRepository.save(
			cartEntity.getSnapshot(),
		);

		return {
			id: updatedCart.id,
			itemCount: updatedCart.items.length,
		};
	}
}
