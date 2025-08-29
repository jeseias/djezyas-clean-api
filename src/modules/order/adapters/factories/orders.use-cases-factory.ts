import {
	isOrganizationMemberService,
	isOrganizationValidService,
} from "@/src/modules/organization/adapters/factories";
import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import { productMongooseRepository } from "@/src/modules/product/adapters/factories/repository.factory";
import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import { isUserValidService } from "@/src/modules/user/adapters/factories/service.factory";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import { MarkOrdersAsPaidByPaymentIntentIdUseCase } from "../../app/use-cases";
import { CalculateOrderTotalsUseCase } from "../../app/use-cases/orders/calculate-order-totals/calculate-order-totals.use-case";
import { CancelOrderUseCase } from "../../app/use-cases/orders/cancel-order/cancel-order.use-case";
import { CreateOrdersFromCartUseCase } from "../../app/use-cases/orders/create-orders-from-cart/create-orders-from-cart.use-case";
import { ExpireOrderUseCase } from "../../app/use-cases/orders/expire-order/expire-order.use-case";
import { FilterOrdersByStatusUseCase } from "../../app/use-cases/orders/filter-orders-by-status/filter-orders-by-status.use-case";
import { GetOrderByIdUseCase } from "../../app/use-cases/orders/get-order-by-id/get-order-by-id.use-case";
import { GetOrdersByOrganizationUseCase } from "../../app/use-cases/orders/get-orders-by-organization/get-orders-by-organization.use-case";
import { GetOrdersByUserUseCase } from "../../app/use-cases/orders/get-orders-by-user/get-orders-by-user.use-case";
import { MarkOrderAsPaidUseCase } from "../../app/use-cases/orders/mark-order-as-paid/mark-order-as-paid.use-case";
import { MoveOrderUseCase } from "../../app/use-cases/orders/move-order/move-order.use-case";
import { SplitCartIntoOrdersUseCase } from "../../app/use-cases/orders/split-cart-into-orders/split-cart-into-orders.use-case";
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
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
	) {}

	calculateOrderTotals(): CalculateOrderTotalsUseCase {
		return new CalculateOrderTotalsUseCase();
	}

	splitCartIntoOrders(): SplitCartIntoOrdersUseCase {
		return new SplitCartIntoOrdersUseCase();
	}

	createOrdersFromCart(): CreateOrdersFromCartUseCase {
		return new CreateOrdersFromCartUseCase(
			this.orderRepository,
			this.cartRepository,
			this.productRepository,
			this.isUserValidService,
			this.isOrganizationValidService,
			this.splitCartIntoOrders(),
		);
	}

	markOrderAsPaid(): MarkOrderAsPaidUseCase {
		return new MarkOrderAsPaidUseCase(
			this.orderRepository,
			this.isUserValidService,
		);
	}

	markOrdersAsPaidByPaymentIntentId(): MarkOrdersAsPaidByPaymentIntentIdUseCase {
		return new MarkOrdersAsPaidByPaymentIntentIdUseCase(this.orderRepository);
	}

	cancelOrder(): CancelOrderUseCase {
		return new CancelOrderUseCase(
			this.orderRepository,
			this.isUserValidService,
		);
	}

	filterOrdersByStatus(): FilterOrdersByStatusUseCase {
		return new FilterOrdersByStatusUseCase(
			this.orderRepository,
			this.isUserValidService,
			this.isOrganizationValidService,
			this.isOrganizationMemberService,
		);
	}

	getOrderById(): GetOrderByIdUseCase {
		return new GetOrderByIdUseCase(
			this.orderRepository,
			this.isUserValidService,
			this.isOrganizationValidService,
			this.isOrganizationMemberService,
		);
	}

	expireOrder(): ExpireOrderUseCase {
		return new ExpireOrderUseCase(
			this.orderRepository,
			this.isUserValidService,
		);
	}

	getOrdersByOrganization(): GetOrdersByOrganizationUseCase {
		return new GetOrdersByOrganizationUseCase(
			this.orderRepository,
			this.isUserValidService,
			this.isOrganizationValidService,
			this.isOrganizationMemberService,
		);
	}

	getOrdersByUser(): GetOrdersByUserUseCase {
		return new GetOrdersByUserUseCase(
			this.orderRepository,
			this.isUserValidService,
		);
	}

	moveOrder(): MoveOrderUseCase {
		return new MoveOrderUseCase(
			this.orderRepository,
			this.isOrganizationMemberService,
		);
	}
}

export const orderUseCasesFactory = new OrderUseCasesFactory(
	orderMongooseRepository,
	cartMongooseRepository,
	productMongooseRepository,
	isUserValidService,
	isOrganizationValidService,
	isOrganizationMemberService,
);
