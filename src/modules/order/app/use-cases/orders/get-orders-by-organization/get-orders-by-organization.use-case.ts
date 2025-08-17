import type { Order } from "@/src/modules/order/domain/entities";
import type {
	OrderFilters,
	OrderRepository,
} from "@/src/modules/order/domain/repositories";
import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";

export namespace GetOrdersByOrganization {
	export enum Grouping {
		DATE = "date",
		STATUS = "status",
	}

	export type Params = {
		userId: string;
		organizationId: string;
		filters?: Omit<OrderFilters.Filters, "offset"> & {
			page?: number;
			limit?: number;
		};
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

export class GetOrdersByOrganizationUseCase {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
	) {}

	async execute(
		params: GetOrdersByOrganization.Params,
	): Promise<GetOrdersByOrganization.Result> {
		await this.isUserValidService.execute(params.userId);

		await this.isOrganizationValidService.execute(params.organizationId);

		await this.isOrganizationMemberService.execute(
			params.userId,
			params.organizationId,
		);

		// Build filters with defaults and convert page to offset
		const filters: OrderFilters.Filters = {
			limit: params.filters?.limit ?? 100,
			offset: params.filters?.page
				? (params.filters.page - 1) * (params.filters.limit ?? 100)
				: 0,
			sortBy: "createdAt",
			sortOrder: "desc",
			...params.filters,
		};

		// Remove page from filters as it's converted to offset
		delete (filters as any).page;

		const result = await this.orderRepository.findAllByOrganizationId(
			params.organizationId,
			filters,
		);

		let groupedOrders: GetOrdersByOrganization.GroupedOrders | undefined;

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
		groupBy: GetOrdersByOrganization.Grouping,
	): GetOrdersByOrganization.GroupedOrders {
		const grouped: GetOrdersByOrganization.GroupedOrders = {};

		for (const order of orders) {
			let key: string;

			if (groupBy === GetOrdersByOrganization.Grouping.DATE) {
				const date = new Date(order.createdAt);
				key = date.toISOString().split("T")[0];
			} else {
				key = order.fulfillmentStatus;
			}

			if (!grouped[key]) {
				grouped[key] = [];
			}

			grouped[key].push(order);
		}

		return grouped;
	}
}
