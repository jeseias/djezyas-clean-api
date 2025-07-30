import { Order } from "@/src/modules/order/domain/entities/order";
import type { OrderRepository } from "@/src/modules/order/domain/repositories/order-repository";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";

export namespace MarkOrdersAsPaidByTransactionId {
	export type Params = {
		transactionId: string;
	};

	export type Result = {
		orders: Order.Model[];
	};
}

export class MarkOrdersAsPaidByTransactionIdUseCase {
	constructor(private readonly orderRepository: OrderRepository) {}

	async execute(
		params: MarkOrdersAsPaidByTransactionId.Params,
	): Promise<MarkOrdersAsPaidByTransactionId.Result> {
		if (!params.transactionId) {
			throw new AppError(
				"Transaction ID is required",
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		// Fetch all orders associated with the transaction ID
		const orders = await this.orderRepository.findAllByTransactionId(
			params.transactionId,
		);

		if (!orders || orders.length === 0) {
			throw new AppError(
				`No orders found for transaction ID: ${params.transactionId}`,
				404,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		const updatedOrders: Order.Model[] = [];

		// Process each order
		for (const orderModel of orders) {
			const orderEntity = Order.Entity.fromModel(orderModel);

			// Only update orders that are pending
			if (orderEntity.isPending()) {
				// Mark the order as paid
				orderEntity.markAsPaid(params.transactionId);

				// Save the updated order
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
