import type { Order } from "@/src/modules/order/domain/entities";

export namespace IMoveOrder {
	export type Input = {
		orderId: string;
		status: Order.FulfillmentStatus;
		organizationId: string;
		userId: string;
	};

	export type Output = Order.Model;
}
