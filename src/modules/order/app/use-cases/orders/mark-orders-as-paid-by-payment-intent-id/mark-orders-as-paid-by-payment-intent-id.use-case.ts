import { Order } from "@/src/modules/order/domain/entities/order";
import type { OrderRepository } from "@/src/modules/order/domain/repositories/order-repository";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";

export namespace MarkOrdersAsPaidByPaymentIntentId {
	export type Params = {
		paymentIntentId: string;
	};

	export type Result = {
		orders: Order.Model[];
	};
}

export class MarkOrdersAsPaidByPaymentIntentIdUseCase {
	constructor(private readonly orderRepository: OrderRepository) {}

	async execute(
		params: MarkOrdersAsPaidByPaymentIntentId.Params,
	): Promise<MarkOrdersAsPaidByPaymentIntentId.Result> {
		if (!params.paymentIntentId) {
			throw new AppError(
				"Payment Intent ID is required",
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		const orders = await this.orderRepository.findAllByPaymentIntentId(
			params.paymentIntentId,
		);

		if (!orders || orders.length === 0) {
			throw new AppError(
				`No orders found for transaction ID: ${params.paymentIntentId}`,
				404,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		const updatedOrders: Order.Model[] = [];

		for (const orderModel of orders) {
			const orderEntity = Order.Entity.fromModel(orderModel);

			if (orderEntity.isPaymentPending()) {
				orderEntity.markAsPaid();

				const updatedOrder = await this.orderRepository.update(
					orderEntity.getSnapshot(),
				);

				updatedOrders.push(updatedOrder);
			}
		}

		return {
			orders: updatedOrders,
		};
	}
}
