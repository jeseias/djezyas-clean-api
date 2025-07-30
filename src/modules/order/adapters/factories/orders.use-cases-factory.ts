import { isOrganizationValidService } from "@/src/modules/organization/adapters/factories";
import type { IsOrganizationValidService } from "@/src/modules/organization/core/app/services";
import {
	priceMongooseRepository,
	productMongooseRepository,
} from "@/src/modules/product/adapters/factories/repository.factory";
import type { PriceRepository } from "@/src/modules/product/core/ports/outbound/price-repository";
import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import { isUserValidService } from "@/src/modules/user/adapters/factories/service.factory";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import { CreateOrdersFromCartUseCase } from "../../app/use-cases/orders/create-orders-from-cart/create-orders-from-cart.use-case";
import { ExpireOrderUseCase } from "../../app/use-cases/orders/expire-order/expire-order.use-case";
import { MarkOrderAsPaidUseCase } from "../../app/use-cases/orders/mark-order-as-paid/mark-order-as-paid.use-case";
import type {
	CartRepository,
	OrderRepository,
} from "../../domain/repositories";
import {
	cartMongooseRepository,
	orderMongooseRepository,
} from "./repository.factory";

export class OrderUseCasesFactory {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly cartRepository: CartRepository,
		private readonly productRepository: ProductRepository,
		private readonly priceRepository: PriceRepository,
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
	) {}

	createOrdersFromCart(): CreateOrdersFromCartUseCase {
		return new CreateOrdersFromCartUseCase(
			this.orderRepository,
			this.cartRepository,
			this.productRepository,
			this.priceRepository,
			this.isUserValidService,
			this.isOrganizationValidService,
		);
	}

	markOrderAsPaid(): MarkOrderAsPaidUseCase {
		return new MarkOrderAsPaidUseCase(
			this.orderRepository,
			this.isUserValidService,
		);
	}

	expireOrder(): ExpireOrderUseCase {
		return new ExpireOrderUseCase(
			this.orderRepository,
			this.isUserValidService,
		);
	}
}

export const orderUseCasesFactory = new OrderUseCasesFactory(
	orderMongooseRepository,
	cartMongooseRepository,
	productMongooseRepository,
	priceMongooseRepository,
	isUserValidService,
	isOrganizationValidService,
);
