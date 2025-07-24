import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import type { CartRepository } from "../../../../domain/repositories/cart-repository";

export namespace GetUserCartSummary {
	export type Params = {
		userId: string;
	};

	export type Result = {
		itemCount: number;
		totalPrice: {
			currency: string;
			value: number;
		};
	};
}

export class GetUserCartSummaryUseCase {
	constructor(
		private readonly cartRepository: CartRepository,
		private readonly productRepository: ProductRepository,
	) {}

	async execute(
		params: GetUserCartSummary.Params,
	): Promise<GetUserCartSummary.Result> {
		const cartModel = await this.cartRepository.findByUserId(params.userId);

		if (!cartModel || cartModel.items.length === 0) {
			return {
				itemCount: 0,
				totalPrice: {
					currency: "USD",
					value: 0,
				},
			};
		}

		const productIds = cartModel.items.map((item) => item.productId);
		const products = await this.productRepository.findManyByIds(productIds);

		const productMap = new Map(products.map((p) => [p.id, p]));

		let total = 0;
		let currency = "USD";

		for (const item of cartModel.items) {
			const product = productMap.get(item.productId);
			if (!product || !product.default_price) continue;

			currency = product.default_price.currency;
			total += item.quantity * product.default_price.unitAmount;
		}

		const itemCount = cartModel.items.reduce(
			(sum, item) => sum + item.quantity,
			0,
		);

		return {
			itemCount,
			totalPrice: {
				currency,
				value: total,
			},
		};
	}
}
