import type { Order } from "@/src/modules/order/domain/entities";
import type { OrderRepository } from "@/src/modules/order/domain/repositories";
import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";

export namespace GetOrderById {
	export type Params = {
		orderId: string;
		userId?: string;
		organizationId?: string;
	};

	export type Result = {
		order: Order.Model;
	};
}

export class GetOrderByIdUseCase {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
	) {}

	async execute(params: GetOrderById.Params): Promise<GetOrderById.Result> {
		if (!params.userId && !params.organizationId) {
			throw new AppError(
				"Either userId or organizationId must be provided",
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		const order = await this.orderRepository.findById(params.orderId);
		if (!order) {
			throw new AppError(
				`Order not found: ${params.orderId}`,
				404,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		if (params.userId) {
			await this.isUserValidService.execute(params.userId);

			if (order.userId !== params.userId) {
				throw new AppError(
					`Order does not belong to user: ${params.orderId}`,
					403,
					ErrorCode.FORBIDDEN,
				);
			}
		}

		if (params.organizationId) {
			await this.isOrganizationValidService.execute(params.organizationId);

			if (params.userId) {
				await this.isOrganizationMemberService.execute(
					params.userId,
					params.organizationId,
				);
			}

			const orderOrganizationIds = order.items.map(
				(item) => item.organizationId,
			);
			if (!orderOrganizationIds.includes(params.organizationId)) {
				throw new AppError(
					`Order does not belong to organization: ${params.orderId}`,
					403,
					ErrorCode.FORBIDDEN,
				);
			}
		}

		return {
			order,
		};
	}
}
