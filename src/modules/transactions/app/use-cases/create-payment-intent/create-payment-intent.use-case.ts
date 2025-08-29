import { Order } from "@/src/modules/order/domain/entities";
import type { OrderRepository } from "@/src/modules/order/domain/repositories";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { TokenManager } from "@/src/modules/shared/ports/outbound/token-manager";
import { generatePaymentReference } from "../../../adapters/payment-providers/multicaixa-express-client";
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
		const { orders, totalAmount } = await this.validate_orders(params);
		const { providerResponse, providerReference } =
			await this.create_payment_session(params, totalAmount);
		const { intentEntity } = this.create_payment_intent(
			params,
			providerResponse,
			providerReference,
			totalAmount,
		);
		const updatedOrders = this.update_orders_with_payment_intent_id(
			orders,
			intentEntity.id,
		);

		await this.orderRepository.updateMany(updatedOrders);
		await this.paymentIntentRepository.create(intentEntity);

		const { token } = await this.generate_payment_token(params, intentEntity);

		return { token };
	}

	private async generate_payment_token(
		params: CreatePaymentIntent.Params,
		intentEntity: PaymentIntent.Model,
	) {
		const token = await this.tokenManager.generateToken(
			{
				pi: intentEntity.id,
				uid: params.userId,
				ord: params.orderIds,
				prv: params.provider,
			},
			"10m",
		);

		return { token };
	}

	private update_orders_with_payment_intent_id(
		orders: Order.Model[],
		paymentIntentId: string,
	) {
		return orders.map((order) => {
			const orderEntity = Order.Entity.fromModel(order);
			orderEntity.add_payment_intent_id(paymentIntentId);
			return orderEntity.getSnapshot();
		});
	}

	private create_payment_intent(
		params: CreatePaymentIntent.Params,
		providerResponse: any,
		providerReference: string,
		totalAmount: number,
	) {
		const intentEntity = PaymentIntent.Entity.create({
			userId: params.userId,
			orderIds: params.orderIds,
			provider: params.provider,
			status: PaymentIntent.Status.PENDING,
			providerReference,
			currency: "AOA",
			expiresAt:
				providerResponse.expiresAt ?? new Date(Date.now() + 5 * 60 * 1000),
			amount: totalAmount,
			metadata: {
				paymentProviderResponse: providerResponse,
			},
		});

		return { intentEntity: intentEntity.getSnapshot() };
	}

	private async create_payment_session(
		params: CreatePaymentIntent.Params,
		totalAmount: number,
	) {
		const paymentService = this.providerRegistry.get(params.provider);
		const providerReference = generatePaymentReference(15, "DJEZ");
		const providerResponse = await paymentService.createSession({
			userId: params.userId,
			amount: totalAmount,
			orderIds: params.orderIds,
			reference: providerReference,
		});

		return {
			providerResponse,
			providerReference,
		};
	}

	private async validate_orders(params: CreatePaymentIntent.Params) {
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

		return {
			orders,
			totalAmount,
		};
	}
}
