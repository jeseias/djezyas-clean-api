import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { Order } from "../../../domain/entities";
import type { OrderRepository } from "../../../domain/repositories/order-repository";

export namespace UpdateOrderStatus {
	export type Params = {
		userId: string;
		orderId: string;
		status: Order.Status;
	};

	export type Result = Order.Model;
}

export class UpdateOrderStatusUseCase {
	constructor(private readonly orderRepository: OrderRepository) {}

	async execute(
		params: UpdateOrderStatus.Params,
	): Promise<UpdateOrderStatus.Result> {
		const orderModel = await this.orderRepository.findById(params.orderId);
		if (!orderModel) {
			throw new AppError(
				`Order with ID ${params.orderId} not found`,
				404,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		if (orderModel.userId !== params.userId) {
			throw new AppError(
				`User ${params.userId} is not authorized to update order ${params.orderId}`,
				403,
				ErrorCode.UNAUTHORIZED,
			);
		}

		const order = Order.Entity.fromModel(orderModel);

		this.updateOrderStatus(order, params.status);

		const updatedOrder = await this.orderRepository.update(order.getSnapshot());

		return updatedOrder;
	}

	private updateOrderStatus(order: Order.Entity, status: Order.Status): void {
		switch (status) {
			case Order.Status.PAID:
				order.markAsPaid();
				break;
			case Order.Status.CANCELLED:
				order.cancel();
				break;
			case Order.Status.EXPIRED:
				order.expire();
				break;
			default:
				throw new AppError(
					`Invalid status: ${status}`,
					400,
					ErrorCode.INVALID_STATUS,
				);
		}
	}
}
