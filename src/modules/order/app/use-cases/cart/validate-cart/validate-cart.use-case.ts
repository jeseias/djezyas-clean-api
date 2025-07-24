import { Product } from "@/src/modules/product/core/domain/entities";
import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import type { CartRepository } from "../../../../domain/repositories/cart-repository";

export namespace ValidateCart {
	export type Params = {
		userId: string;
	};

	export type Result = {
		isValid: boolean;
		issues: string[];
	};
}

export class ValidateCartUseCase {
	constructor(
		private readonly cartRepository: CartRepository,
		private readonly productRepository: ProductRepository,
	) {}

	async execute(params: ValidateCart.Params): Promise<ValidateCart.Result> {
		const issues: string[] = [];

		const cartModel = await this.cartRepository.findByUserId(params.userId);

		if (!cartModel) {
			return { isValid: false, issues: ["Cart is empty"] };
		}

		if (cartModel.items.length === 0) {
			return { isValid: false, issues: ["No items in cart"] };
		}

		for (const item of cartModel.items) {
			const product = await this.productRepository.findById(item.productId);

			if (!product) {
				issues.push(`Product ${item.productId} does not exist`);
				continue;
			}

			const productEntity = Product.Entity.fromModel(product);

			if (!productEntity.isActive()) {
				issues.push(`Product ${item.productId} is not available`);
			}

			if (!product.default_price) {
				issues.push(`Product ${item.productId} has no price`);
			}
		}

		return {
			isValid: issues.length === 0,
			issues,
		};
	}
}
