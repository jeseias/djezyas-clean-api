import { Order } from "@/src/modules/order/domain/entities";
import type {
	CartRepository,
	OrderRepository,
} from "@/src/modules/order/domain/repositories";
import type { IsOrganizationValidService } from "@/src/modules/organization/core/app/services";
import type { Price } from "@/src/modules/product/core/domain/entities";
import type { PriceRepository } from "@/src/modules/product/core/ports/outbound/price-repository";
import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { Id } from "@/src/modules/shared/value-objects";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import type { SplitCartIntoOrdersUseCase } from "../split-cart-into-orders/split-cart-into-orders.use-case";

export namespace CreateOrdersFromCart {
	export type Params = {
		userId: string;
		productIds?: string[];
		meta?: Record<string, any>;
	};

	export type Result = {
		orders: Order.Model[];
	};
}

export class CreateOrdersFromCartUseCase {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly cartRepository: CartRepository,
		private readonly productRepository: ProductRepository,
		private readonly priceRepository: PriceRepository,
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly splitCartIntoOrdersUseCase: SplitCartIntoOrdersUseCase,
	) {}

	async execute(
		params: CreateOrdersFromCart.Params,
	): Promise<CreateOrdersFromCart.Result> {
		await this.isUserValidService.execute(params.userId);

		const cartModel = await this.cartRepository.findByUserId(params.userId);
		if (!cartModel || cartModel.items.length === 0) {
			throw new AppError("Cart is empty", 400, ErrorCode.INVALID_OPERATION);
		}

		let cartItems = cartModel.items;
		if (params.productIds && params.productIds.length > 0) {
			cartItems = cartModel.items.filter((item) =>
				params.productIds!.includes(item.productId),
			);

			if (cartItems.length === 0) {
				throw new AppError(
					"None of the requested products are in the cart",
					400,
					ErrorCode.INVALID_OPERATION,
				);
			}
		}

		const productIds = [...new Set(cartItems.map((item) => item.productId))];

		const products = await this.productRepository.findManyByIds(productIds);

		if (products.length !== productIds.length) {
			throw new AppError(
				"Some products not found",
				404,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		const splitResult = await this.splitCartIntoOrdersUseCase.execute({
			cartItems,
			products,
		});

		const organizationIds = Object.keys(splitResult.ordersByOrganization);
		for (const organizationId of organizationIds) {
			await this.isOrganizationValidService.execute(organizationId);
		}

		const productsMap = new Map(
			products.map((product) => [product.id, product]),
		);

		const allProductIds = Array.from(productsMap.keys());
		const allPrices =
			await this.priceRepository.findManyByProductIds(allProductIds);

		const activePricesMap = new Map<Id, Price.Model>();
		for (const price of allPrices) {
			if (price.status === "active") {
				activePricesMap.set(price.productId, price);
			}
		}

		const createdOrders: Order.Model[] = [];

		for (const [organizationId, cartItems] of Object.entries(splitResult.ordersByOrganization)) {
			const orderItems: Order.Item[] = [];

			for (const cartItem of cartItems) {
				const product = productsMap.get(cartItem.productId)!;
				const activePrice = activePricesMap.get(product.id);

				if (!activePrice) {
					throw new AppError(
						`No active price found for product: ${product.name}`,
						400,
						ErrorCode.INVALID_OPERATION,
					);
				}

				const orderItem: Order.Item = {
					priceId: activePrice.id,
					productId: product.id,
					organizationId: organizationId as Id,
					name: product.name,
					quantity: cartItem.quantity,
					unitAmount: activePrice.unitAmount,
					subtotal: cartItem.quantity * activePrice.unitAmount,
				};

				orderItems.push(orderItem);
			}

			const orderEntity = Order.Entity.create({
				userId: params.userId as Id,
				items: orderItems,
				meta: params.meta,
			});

			const orderModel = orderEntity.getSnapshot();
			const createdOrder = await this.orderRepository.create(orderModel);
			createdOrders.push(createdOrder);
		}

		return {
			orders: createdOrders,
		};
	}
}
