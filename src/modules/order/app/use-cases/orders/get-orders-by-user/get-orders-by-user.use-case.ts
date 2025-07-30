import type { Order } from "@/src/modules/order/domain/entities";
import type {
	OrderFilters,
	OrderRepository,
} from "@/src/modules/order/domain/repositories";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";

export namespace GetOrdersByUser {
	export enum Grouping {
		DATE = "date",
		STATUS = "status",
	}

	export type Params = {
		userId: string;
		filters?: OrderFilters.Filters;
		groupBy?: Grouping;
	};

	export type GroupedOrders = {
		[key: string]: Order.Model[];
	};

	export type Result = {
		orders: Order.Model[];
		totalItems: number;
		groupedOrders?: GroupedOrders;
	};
}

export class GetOrdersByUserUseCase {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly isUserValidService: IsUserValidService,
	) {}

	async execute(
		params: GetOrdersByUser.Params,
	): Promise<GetOrdersByUser.Result> {
		await this.isUserValidService.execute(params.userId);

		const filters: OrderFilters.Filters = {
			limit: 100,
			sortBy: "createdAt",
			sortOrder: "desc",
			...params.filters,
		};

		const result = await this.orderRepository.findAllByUserId(
			params.userId,
			filters,
		);

		let groupedOrders: GetOrdersByUser.GroupedOrders | undefined;

		if (params.groupBy) {
			groupedOrders = this.groupOrders(result.items, params.groupBy);
		}

		return {
			orders: result.items,
			totalItems: result.totalItems,
			groupedOrders,
		};
	}

	private groupOrders(
		orders: Order.Model[],
		groupBy: GetOrdersByUser.Grouping,
	): GetOrdersByUser.GroupedOrders {
		const grouped: GetOrdersByUser.GroupedOrders = {};

		for (const order of orders) {
			let key: string;

			if (groupBy === GetOrdersByUser.Grouping.DATE) {
				const date = new Date(order.createdAt);
				key = date.toISOString().split("T")[0];
			} else {
				key = order.status;
			}

			if (!grouped[key]) {
				grouped[key] = [];
			}

			grouped[key].push(order);
		}

		return grouped;
	}
}
