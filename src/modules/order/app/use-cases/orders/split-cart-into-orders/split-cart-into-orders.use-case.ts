import type { Cart } from "@/src/modules/order/domain/entities/cart";
import type { Product } from "@/src/modules/product/core/domain/entities";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";

export namespace SplitCartIntoOrders {
	export type Params = {
		cartItems: Cart.Item[];
		products: Product.Model[];
	};

	export type Result = {
		ordersByOrganization: Record<string, Cart.Item[]>;
	};
}

export class SplitCartIntoOrdersUseCase {
	async execute(
		params: SplitCartIntoOrders.Params,
	): Promise<SplitCartIntoOrders.Result> {
		if (!params.cartItems || params.cartItems.length === 0) {
			throw new AppError(
				"Cart items cannot be empty",
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		if (!params.products || params.products.length === 0) {
			throw new AppError(
				"Products list cannot be empty",
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		const productsMap = new Map<string, Product.Model>();
		for (const product of params.products) {
			if (productsMap.has(product.id)) {
				throw new AppError(
					`Duplicate product ID found: ${product.id}`,
					400,
					ErrorCode.INVALID_OPERATION,
				);
			}
			productsMap.set(product.id, product);
		}

		const missingProductIds: string[] = [];
		for (const cartItem of params.cartItems) {
			if (!productsMap.has(cartItem.productId)) {
				missingProductIds.push(cartItem.productId);
			}
		}

		if (missingProductIds.length > 0) {
			throw new AppError(
				`Products not found: ${missingProductIds.join(", ")}`,
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		const ordersByOrganization = new Map<string, Cart.Item[]>();

		for (const cartItem of params.cartItems) {
			const product = productsMap.get(cartItem.productId)!;
			const organizationId = product.organizationId;

			if (!ordersByOrganization.has(organizationId)) {
				ordersByOrganization.set(organizationId, []);
			}

			ordersByOrganization.get(organizationId)!.push(cartItem);
		}

		return {
      ordersByOrganization: Object.fromEntries(ordersByOrganization),
		};
	}
}
