import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import { Price } from "@/src/modules/product/core/domain/entities";
import type { PriceRepository } from "@/src/modules/product/core/ports/outbound/price-repository";
import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import { Order } from "../../../domain/entities";
import type { OrderRepository } from "../../../domain/repositories/order-repository";

export namespace CreateOrder {
	export type Item = {
		priceId: string;
		quantity: number;
	};

	export type Params = {
		userId: string;
		organizationId: string;
		items: Item[];
		meta?: Record<string, any>;
	};

	export type Result = Order.Model;
}

export class CreateOrderUseCase {
	constructor(
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
		private readonly orderRepository: OrderRepository,
		private readonly productRepository: ProductRepository,
		private readonly priceRepository: PriceRepository,
	) {}

	async execute(params: CreateOrder.Params): Promise<CreateOrder.Result> {
		await this.validateUserAccess(params.userId, params.organizationId);

		if (!params.items || params.items.length === 0) {
			throw new AppError(
				"Order must have at least one item",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		const enrichedItems = await this.validateAndEnrichItems(params.items);

		const order = Order.Entity.create({
			userId: params.userId,
			organizationId: params.organizationId,
			items: enrichedItems,
		});

		const savedOrder = await this.orderRepository.create(order.getSnapshot());

		return savedOrder;
	}

	private async validateUserAccess(
		userId: string,
		organizationId: string,
	): Promise<void> {
		await this.isUserValidService.execute(userId);
		await this.isOrganizationValidService.execute(organizationId);
		await this.isOrganizationMemberService.execute(userId, organizationId);
	}

	private async validateAndEnrichItems(
		items: CreateOrder.Item[],
	): Promise<Order.CreateParams["items"]> {
		const enrichedItems: Order.CreateParams["items"] = [];

		for (const item of items) {
			if (item.quantity <= 0) {
				throw new AppError(
					"Item quantity must be greater than zero",
					400,
					ErrorCode.INVALID_QUANTITY,
				);
			}

			const priceModel = await this.priceRepository.findById(item.priceId);
			if (!priceModel) {
				throw new AppError(
					`Price with ID ${item.priceId} not found`,
					404,
					ErrorCode.ENTITY_NOT_FOUND,
				);
			}
			const price = Price.Entity.fromModel(priceModel);
			if (!price.isValid()) {
				throw new AppError(
					`Invalid or inactive price with ID ${item.priceId}`,
					400,
					ErrorCode.INVALID_PRICE,
				);
			}

			const product = await this.productRepository.findById(price.productId);
			if (!product || product.status !== "active") {
				throw new AppError(
					`Associated product is not available for ordering`,
					400,
					ErrorCode.PRODUCT_NOT_ACTIVE,
				);
			}

			enrichedItems.push({
				priceId: price.id,
				productId: product.id,
				name: product.name,
				quantity: item.quantity,
				unitAmount: price.unitAmount,
				product: product,
				price: price.getSnapshot(),
			});
		}

		return enrichedItems;
	}
}
