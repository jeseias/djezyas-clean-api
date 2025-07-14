import {
	isOrganizationMemberService,
	isOrganizationValidService,
} from "@/src/modules/organization/adapters/factories";
import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import {
	priceMongooseRepository,
	productMongooseRepository,
} from "@/src/modules/product/adapters/factories/repository.factory";
import type { PriceRepository } from "@/src/modules/product/core/ports/outbound/price-repository";
import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import { isUserValidService } from "@/src/modules/user/adapters/factories/service.factory";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import { CreateOrderUseCase } from "../../app/use-cases";
import type { OrderRepository } from "../../domain/repositories/order-repository";
import { orderMongooseRepository } from "./repository.factory";

export class OrderUseCasesFactory {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly productRepository: ProductRepository,
		private readonly priceRepository: PriceRepository,
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
	) {}

	createOrder() {
		return new CreateOrderUseCase(
			this.isUserValidService,
			this.isOrganizationValidService,
			this.isOrganizationMemberService,
			this.orderRepository,
			this.productRepository,
			this.priceRepository,
		);
	}
}

export const orderUseCasesFactory = new OrderUseCasesFactory(
	orderMongooseRepository,
	productMongooseRepository,
	priceMongooseRepository,
	isUserValidService,
	isOrganizationValidService,
	isOrganizationMemberService,
);
