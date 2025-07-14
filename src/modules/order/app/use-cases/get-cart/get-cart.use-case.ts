import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { CartRepository } from "../../../domain/repositories/cart-repository";

export namespace GetCart {
	export type Params = {
		userId: string;
	};

	export type Result = {
		id: string;
		userId: string;
		items: Array<{
			productId: string;
			quantity: number;
		}>;
		itemCount: number;
		createdAt: Date;
		updatedAt: Date;
	} | null;
}

export class GetCartUseCase {
	constructor(private readonly cartRepository: CartRepository) {}

	async execute(params: GetCart.Params): Promise<GetCart.Result> {
		const cartModel = await this.cartRepository.findByUserId(params.userId);

		if (!cartModel) {
			throw new AppError("Cart not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		return {
			id: cartModel.id,
			userId: cartModel.userId,
			items: cartModel.items.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
			})),
			itemCount: cartModel.items.reduce(
				(count, item) => count + item.quantity,
				0,
			),
			createdAt: cartModel.createdAt,
			updatedAt: cartModel.updatedAt,
		};
	}
}
