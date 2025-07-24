import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { Id } from "@/src/modules/shared/value-objects";
import { Cart } from "../../../../domain/entities";
import type { CartRepository } from "../../../../domain/repositories/cart-repository";

export namespace ClearCart {
	export type Params = {
		userId: string;
	};

	export type Result = {
		id: Id;
	};
}

export class ClearCartUseCase {
	constructor(private readonly cartRepository: CartRepository) {}

	async execute(params: ClearCart.Params): Promise<ClearCart.Result> {
		const cartModel = await this.cartRepository.findByUserId(params.userId);
		if (!cartModel) {
			throw new AppError("Cart not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		const cartEntity = Cart.Entity.fromModel(cartModel);

		if (cartEntity.isEmpty()) {
			throw new AppError(
				"Cart is already empty",
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		cartEntity.clear();

		const updatedCart = await this.cartRepository.save(
			cartEntity.getSnapshot(),
		);

		return {
			id: updatedCart.id,
		};
	}
}
