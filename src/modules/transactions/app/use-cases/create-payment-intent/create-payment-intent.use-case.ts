import { Order } from "@/src/modules/order/domain/entities";
import type { OrderRepository } from "@/src/modules/order/domain/repositories";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { TokenManager } from "@/src/modules/shared/ports/outbound/token-manager";
import { PaymentIntent } from "../../../domain/entities";
import type { PaymentIntentRepository } from "../../../domain/repositories";
import type { PaymentProviderServiceRegistry } from "../../services/payment-provider-service-registry";

export namespace CreatePaymentIntent {
	export type Params = {
		userId: string;
		orderIds: string[];
		provider: PaymentIntent.Provider;
	};

	export type Result = {
		token: string;
	};
}

export class CreatePaymentIntentUseCase {
	constructor(
		private readonly paymentIntentRepository: PaymentIntentRepository,
		private readonly orderRepository: OrderRepository,
		private readonly providerRegistry: PaymentProviderServiceRegistry,
		private readonly tokenManager: TokenManager,
	) {}

	async execute(
		params: CreatePaymentIntent.Params,
	): Promise<CreatePaymentIntent.Result> {
		if (params.orderIds.length === 0) {
			throw new AppError(
				"Missing order reference",
				400,
				ErrorCode.INVALID_INPUT,
			);
		}

		const orders = await this.orderRepository.findManyByIds(params.orderIds);

		if (orders.length !== params.orderIds.length) {
			throw new AppError(
				"Some orders not found",
				404,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		if (orders.some((order) => order.userId !== params.userId)) {
			throw new AppError(
				"Order ownership mismatch",
				403,
				ErrorCode.UNAUTHORIZED,
			);
		}

		const totalAmount = orders.reduce(
			(sum, order) => sum + order.totalAmount,
			0,
		);

		if (totalAmount === 0) {
			throw new AppError(
				"Total amount must be greater than 0",
				400,
				ErrorCode.INVALID_INPUT,
			);
		}

		if (orders.some((o) => o.paymentStatus !== Order.PaymentStatus.PENDING)) {
			throw new AppError(
				"Only fulfilled orders can be paid",
				400,
				ErrorCode.INVALID_INPUT,
			);
		}

		const paymentService = this.providerRegistry.get(params.provider);
		const providerResponse = await paymentService.createSession({
			userId: params.userId,
			amount: totalAmount,
			orderIds: params.orderIds,
		});

		const intentEntity = PaymentIntent.Entity.create({
			userId: params.userId,
			orderIds: params.orderIds,
			provider: params.provider,
			status: PaymentIntent.Status.PENDING,
			providerReference: providerResponse.reference,
			currency: "AOA",
			transactionIds: providerResponse.transactionId
				? [providerResponse.transactionId]
				: undefined,
			expiresAt:
				providerResponse.expiresAt ?? new Date(Date.now() + 5 * 60 * 1000),
			amount: totalAmount,
			metadata: {
				paymentProviderResponse: providerResponse,
			},
		});

		await this.paymentIntentRepository.create(intentEntity.getSnapshot());

		const token = await this.tokenManager.generateToken(
			{
				pi: intentEntity.getSnapshot().id,
				uid: params.userId,
				ord: params.orderIds,
				prv: params.provider,
			},
			"10m",
		);

		return { token };
	}
}
