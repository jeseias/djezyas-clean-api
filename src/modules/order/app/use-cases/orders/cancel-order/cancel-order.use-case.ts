import { Order } from "@/src/modules/order/domain/entities";
import type { OrderRepository } from "@/src/modules/order/domain/repositories";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";

export namespace CancelOrder {
	export type Params = {
		userId: string;
		orderId: string;
		reason?: string;
	};

	export type Result = {
		order: Order.Model;
	};
}

export class CancelOrderUseCase {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly isUserValidService: IsUserValidService,
	) {}

	async execute(params: CancelOrder.Params): Promise<CancelOrder.Result> {
		await this.isUserValidService.execute(params.userId);

		if (!params.orderId) {
			throw new AppError(
				"Order ID is required",
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		const orderModel = await this.orderRepository.findById(params.orderId);
		if (!orderModel) {
			throw new AppError(
				`Order not found: ${params.orderId}`,
				404,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		if (orderModel.userId !== params.userId) {
			throw new AppError(
				`Order does not belong to user: ${params.orderId}`,
				403,
				ErrorCode.FORBIDDEN,
			);
		}

		const orderEntity = Order.Entity.fromModel(orderModel);

		if (orderEntity.isPaid()) {
			throw new AppError(
				`Cannot cancel a paid order: ${params.orderId}`,
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		if (!orderEntity.isPending()) {
			throw new AppError(
				`Only pending orders can be cancelled. Current status: ${orderModel.status}`,
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		orderEntity.cancel(params.reason);

		const updatedOrder = await this.orderRepository.update(
			orderEntity.getSnapshot(),
		);

		return {
			order: updatedOrder,
		};
	}
} 