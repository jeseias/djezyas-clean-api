import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import { Cart } from "../../../domain/entities";
import type { CartRepository } from "../../../domain/repositories/cart-repository";

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

		const products = await this.productRepository.findManyByIds(productIds);

		return {
			id: cartModel.id,
			userId: cartModel.userId,
			items: cartModel.items,
			itemCount: cartModel.items.reduce(
				(count, item) => count + item.quantity,
				0,
			),
			createdAt: cartModel.createdAt,
			updatedAt: cartModel.updatedAt,
		};
	}
}
