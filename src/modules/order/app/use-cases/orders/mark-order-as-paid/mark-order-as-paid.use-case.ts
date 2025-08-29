import { Order } from "@/src/modules/order/domain/entities";
import type { OrderRepository } from "@/src/modules/order/domain/repositories";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";

export namespace MarkOrderAsPaid {
	export type Params = {
		userId: string;
		orderIds: string[];
		transactionId?: string;
	};

	export type Result = {
		orders: Order.Model[];
	};
}

export class MarkOrderAsPaidUseCase {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly isUserValidService: IsUserValidService,
	) {}

	async execute(
		params: MarkOrderAsPaid.Params,
	): Promise<MarkOrderAsPaid.Result> {
		await this.isUserValidService.execute(params.userId);

		if (!params.orderIds || params.orderIds.length === 0) {
			throw new AppError(
				"Order IDs are required",
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		const updatedOrders: Order.Model[] = [];

		for (const orderId of params.orderIds) {
			const orderModel = await this.orderRepository.findById(orderId);
			if (!orderModel) {
				throw new AppError(
					`Order not found: ${orderId}`,
					404,
					ErrorCode.ENTITY_NOT_FOUND,
				);
			}

			if (orderModel.userId !== params.userId) {
				throw new AppError(
					`Order does not belong to user: ${orderId}`,
					403,
					ErrorCode.FORBIDDEN,
				);
			}

			const orderEntity = Order.Entity.fromModel(orderModel);

			if (orderEntity.isPaid()) {
				throw new AppError(
					`Order is already paid: ${orderId}`,
					400,
					ErrorCode.INVALID_OPERATION,
				);
			}

			if (!orderEntity.isPaymentPending()) {
				throw new AppError(
					`Order cannot be marked as paid. Current status: ${orderModel.fulfillmentStatus}`,
					400,
					ErrorCode.INVALID_OPERATION,
				);
			}

			orderEntity.markAsPaid();

			const updatedOrder = await this.orderRepository.update(
				orderEntity.getSnapshot(),
			);

			updatedOrders.push(updatedOrder);
		}

		return {
			orders: updatedOrders,
		};
	}
}
