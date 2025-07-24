import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { tryCatchSync } from "@/src/modules/shared/utils";
import type { Id } from "@/src/modules/shared/value-objects";
import { Cart } from "../../../../domain/entities";
import type { CartRepository } from "../../../../domain/repositories/cart-repository";

export namespace UpdateItemQuantity {
	export type Params = {
		userId: string;
		productId: string;
		quantity: number;
	};

	export type Result = {
		id: Id;
		itemCount: number;
	};
}

export class UpdateItemQuantityUseCase {
	constructor(private readonly cartRepository: CartRepository) {}

	async execute(
		params: UpdateItemQuantity.Params,
	): Promise<UpdateItemQuantity.Result> {
		if (!Number.isInteger(params.quantity) || params.quantity <= 0) {
			throw new AppError(
				"Quantity must be a positive integer",
				400,
				ErrorCode.INVALID_QUANTITY,
			);
		}

		if (params.quantity > 100) {
			throw new AppError(
				"Quantity exceeds limit",
				400,
				ErrorCode.INVALID_QUANTITY,
			);
		}

		const cartModel = await this.cartRepository.findByUserId(params.userId);
		if (!cartModel) {
			throw new AppError("Cart not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		const cartEntity = Cart.Entity.fromModel(cartModel);

		tryCatchSync(
			() => cartEntity.updateItem(params.productId as Id, params.quantity),
			"Item not found in cart",
			ErrorCode.ENTITY_NOT_FOUND,
			404,
		);

		const updatedCart = await this.cartRepository.save(
			cartEntity.getSnapshot(),
		);

		return {
			id: updatedCart.id,
			itemCount: updatedCart.items.length,
		};
	}
}
