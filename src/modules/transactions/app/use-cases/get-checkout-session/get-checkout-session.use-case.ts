import type { Order } from "@/src/modules/order/domain/entities";
import type { OrderRepository } from "@/src/modules/order/domain/repositories";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { TokenManager } from "@/src/modules/shared/ports/outbound/token-manager";
import { PaymentIntent } from "../../../domain/entities";
import type { PaymentIntentRepository } from "../../../domain/repositories";

export namespace GetCheckoutSession {
	export type Params = { token: string };

	export type Result = {
		paymentIntentId: string;
		status: PaymentIntent.Status;
		expiresAt?: Date;
		provider: PaymentIntent.Provider;
		totalAmount: number;
		orders: Order.Model[];
		transactionId?: string;
	};
}

export class GetCheckoutSessionUseCase {
	constructor(
		private readonly paymentIntentRepository: PaymentIntentRepository,
		private readonly orderRepository: OrderRepository,
		private readonly tokenManager: TokenManager,
	) {}

	async execute(
		params: GetCheckoutSession.Params,
	): Promise<GetCheckoutSession.Result> {
		// Verify token and get payload
		const payload = await this.tokenManager.verifyToken(params.token);
		
		if (!payload.pi || !payload.uid || !payload.ord) {
			throw new AppError("Invalid token", 401, ErrorCode.UNAUTHORIZED);
		}

		// Load payment intent
		const paymentIntent = await this.paymentIntentRepository.findById(payload.pi as string);
		if (!paymentIntent) {
			throw new AppError("Payment intent not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		// Load orders
		const orderIds = Array.isArray(payload.ord) ? payload.ord as string[] : [];
		const orders = await this.orderRepository.findManyByIds(orderIds);
		if (orders.length !== orderIds.length) {
			throw new AppError("Some orders not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		return {
			paymentIntentId: paymentIntent.id,
			status: paymentIntent.status,
			expiresAt: paymentIntent.expiresAt,
			provider: paymentIntent.provider,
			totalAmount: paymentIntent.amount,
			transactionId: paymentIntent.metadata?.paymentProviderResponse?.transactionId,
			orders,
		};
	}
}
