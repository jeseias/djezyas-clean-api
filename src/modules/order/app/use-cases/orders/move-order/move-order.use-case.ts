import { Order } from "@/src/modules/order/domain/entities";
import type { OrderRepository } from "@/src/modules/order/domain/repositories";
import type { IsOrganizationMemberService } from "@/src/modules/organization/core/app/services";
import { AppError, ErrorCode } from "@/src/modules/shared";
import type { IMoveOrder } from "./move-order.types";

export class MoveOrderUseCase {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
	) {}

	async execute(input: IMoveOrder.Input): Promise<IMoveOrder.Output> {
		const { orderId, status, organizationId, userId } = input;

		await this.isOrganizationMemberService.execute(organizationId, userId);

		const order = await this.orderRepository.findById(orderId);

		if (!order) {
			throw new AppError("Order not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		if (order.organizationId !== organizationId) {
			throw new AppError(
				"Order does not belong to organization",
				403,
				ErrorCode.FORBIDDEN,
			);
		}

		if (order.userId !== userId) {
			throw new AppError(
				"Order does not belong to user",
				403,
				ErrorCode.FORBIDDEN,
			);
		}

		const orderEntity = Order.Entity.fromModel(order);

		try {
			orderEntity.updateFulfillmentStatus(status);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Invalid status";
			throw new AppError(errorMessage, 400, ErrorCode.INVALID_STATUS);
		}

		const updatedOrder = orderEntity.getSnapshot();
		await this.orderRepository.update(updatedOrder);

		return updatedOrder;
	}
}
