import { Product } from "@/src/modules/product/core/domain/entities";
import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { Id } from "@/src/modules/shared/value-objects";
import { Cart } from "../../../../domain/entities";
import type { CartRepository } from "../../../../domain/repositories/cart-repository";

export namespace AddToCart {
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

export class AddToCartUseCase {
	constructor(
		private readonly cartRepository: CartRepository,
		private readonly productRepository: ProductRepository,
	) {}

	async execute(params: AddToCart.Params): Promise<AddToCart.Result> {
		if (!Number.isInteger(params.quantity) || params.quantity <= 0) {
			throw new AppError("Invalid quantity", 400, ErrorCode.INVALID_QUANTITY);
		}

		if (params.quantity > 100) {
			throw new AppError(
				"Quantity exceeds limit",
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

		const product = await this.productRepository.findById(params.productId);

		if (!product || !product.default_price) {
			throw new AppError(
				"Product not found or has no default price",
				404,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		if (product.status !== Product.Status.ACTIVE) {
			throw new AppError(
				"Product is not available for purchase",
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		cartEntity.addItem(params.productId, params.quantity);

		const updatedCart = await this.cartRepository.save(
			cartEntity.getSnapshot(),
		);

		return {
			id: updatedCart.id,
			itemCount: updatedCart.items.length,
		};
	}
}
