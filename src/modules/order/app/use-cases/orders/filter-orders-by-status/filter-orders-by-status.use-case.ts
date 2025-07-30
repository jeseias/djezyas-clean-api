import type { Order } from "@/src/modules/order/domain/entities";
import type {
	OrderFilters,
	OrderRepository,
} from "@/src/modules/order/domain/repositories";
import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";

export namespace FilterOrdersByStatus {
	export type Params = {
		userId: string;
		organizationId: string;
		status?: Order.Status[];
		fromDate?: Date;
		toDate?: Date;
		page?: number;
		limit?: number;
	};

	export type Result = {
		orders: Order.Model[];
		totalItems: number;
	};
}

export class FilterOrdersByStatusUseCase {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
	) {}

	async execute(
		params: FilterOrdersByStatus.Params,
	): Promise<FilterOrdersByStatus.Result> {
		if (!params.organizationId) {
			throw new AppError(
				"Organization ID is required",
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		await this.isUserValidService.execute(params.userId);

		await this.isOrganizationValidService.execute(params.organizationId);

		await this.isOrganizationMemberService.execute(
			params.userId,
			params.organizationId,
		);

		const filters: OrderFilters.Filters = {
			limit: params.limit ?? 100,
			offset: params.page ? (params.page - 1) * (params.limit ?? 100) : 0,
			sortBy: "createdAt",
			sortOrder: "desc",
		};

		if (params.fromDate) {
			filters.createdAfter = params.fromDate;
		}

		if (params.toDate) {
			filters.createdBefore = params.toDate;
		}

		if (params.status && params.status.length > 0) {
			filters.status = params.status[0];
		}

		const result = await this.orderRepository.findAllByOrganizationId(
			params.organizationId,
			filters,
		);

		let filteredOrders = result.items;
		if (params.status && params.status.length > 1) {
			filteredOrders = result.items.filter((order) =>
				params.status!.includes(order.status),
			);
		}

		return {
			orders: filteredOrders,
			totalItems: filteredOrders.length,
		};
	}
}
