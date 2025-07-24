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
		try {
			if (!Number.isInteger(params.quantity) || params.quantity <= 0) {
				throw new AppError("Invalid quantity", 400, ErrorCode.INVALID_QUANTITY);
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

			const updatedCart = await this.cartRepository.save(
				cartEntity.getSnapshot(),
			);

			return updatedCart;
		} catch (error) {
			console.log(error);
			throw new AppError(
				"Failed to add item to cart",
				500,
				ErrorCode.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
