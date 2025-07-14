import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { Cart } from "../../../domain/entities";
import type { CartRepository } from "../../../domain/repositories/cart-repository";

export namespace AddToCart {
	export type Params = {
		userId: string;
		productId: string;
		quantity: number;
	};

	export type Result = Cart.Model;
}

export class AddToCartUseCase {
	constructor(private readonly cartRepository: CartRepository) {}

	async execute(params: AddToCart.Params): Promise<AddToCart.Result> {
		if (params.quantity <= 0) {
			throw new AppError(
				"Quantity must be greater than zero",
				400,
				ErrorCode.INVALID_QUANTITY,
			);
		}

		const existingCartModel = await this.cartRepository.findByUserId(
			params.userId,
		);

		const cartEntity = existingCartModel
			? Cart.Entity.fromModel(existingCartModel)
			: Cart.Entity.create({
					userId: params.userId,
					items: [],
				});

		cartEntity.addItem(params.productId, params.quantity);

		const updatedCart = await this.cartRepository.update(
			cartEntity.getSnapshot(),
		);

		return updatedCart;
	}
}
