import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import { Cart } from "../../../../domain/entities";
import type { CartRepository } from "../../../../domain/repositories/cart-repository";

export namespace GetCart {
	export type Params = {
		userId: string;
	};

	export type Result = {
		id: string;
		userId: string;
		items: Cart.EnrichedItem[];
		itemCount: number;
		createdAt: Date;
		updatedAt: Date;
	};
}

export class GetCartUseCase {
	constructor(
		private readonly cartRepository: CartRepository,
		private readonly productRepository: ProductRepository,
	) {}

	async execute(params: GetCart.Params): Promise<GetCart.Result> {
		let cartModel = await this.cartRepository.findByUserId(params.userId);

		if (!cartModel) {
			const cartEntity = Cart.Entity.create({
				userId: params.userId,
				items: [],
			});

			await this.cartRepository.save(cartEntity.getSnapshot());
			cartModel = cartEntity.getSnapshot();
		}

		const productIds = cartModel.items.map((item) => item.productId);
		const products = await this.productRepository.findManyByIds(productIds);

		const productMap = new Map(
			products.map((product) => [
				product.id,
				{
					slug: product.slug,
					name: product.name,
					imageUrl: product.imageUrl,
					price: {
						currency: product.default_price?.currency || "AOA",
						unitAmount: product.default_price?.unitAmount ?? 0,
					},
				},
			]),
		);

		const enrichedItems: Cart.EnrichedItem[] = cartModel.items.map((item) => {
			const product = productMap.get(item.productId);
			if (!product) {
				throw new Error(`Product ${item.productId} not found in repository`);
			}

			return {
				productId: item.productId,
				quantity: item.quantity,
				product,
			};
		});

		return {
			id: cartModel.id,
			userId: cartModel.userId,
			items: enrichedItems,
			itemCount: cartModel.items.reduce(
				(count, item) => count + item.quantity,
				0,
			),
			createdAt: cartModel.createdAt,
			updatedAt: cartModel.updatedAt,
		};
	}
}
