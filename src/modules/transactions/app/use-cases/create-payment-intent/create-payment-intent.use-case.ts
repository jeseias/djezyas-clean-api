import type { OrderRepository } from "@/src/modules/order/domain/repositories";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { PaymentIntent } from "../../../domain/entities";
import type { PaymentIntentRepository } from "../../../domain/repositories";
import type { PaymentProviderServiceRegistry } from "../../services/payment-provider-service-registry";

export namespace CreatePaymentIntent {
	export type Params = {
		userId: string;
		orderIds: string[];
		provider: PaymentIntent.Provider;
		metadata?: Record<string, any>;
		providerExtraData?: {
			afrimoney?: {
				phoneNumber: string;
				email?: string;
			};
			stripe?: {
				currency?: string;
				paymentMethodId?: string;
			};
			multicaixa_express?: {
				reference?: string;
			};
			[key: string]: Record<string, any> | undefined;
		};
	};

	export type Result = {
		intent: PaymentIntent.Model;
	};
}

export class CreatePaymentIntentUseCase {
	constructor(
		private readonly paymentIntentRepository: PaymentIntentRepository,
		private readonly orderRepository: OrderRepository,
		private readonly providerRegistry: PaymentProviderServiceRegistry,
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

		const paymentService = this.providerRegistry.get(params.provider);
		const providerResponse = await paymentService.createSession({
			userId: params.userId,
			amount: totalAmount,
			orderIds: params.orderIds,
			metadata: params.metadata,
			providerExtraData: params.providerExtraData,
		});

		const intentEntity = PaymentIntent.Entity.create({
			userId: params.userId,
			orderIds: params.orderIds,
			provider: params.provider,
			status: "pending",
			transactionId: providerResponse.transactionId,
			expiresAt:
				providerResponse.expiresAt ?? new Date(Date.now() + 5 * 60 * 1000),
			metadata: params.metadata,
			amount: totalAmount,
		});

		const saved = await this.paymentIntentRepository.create(
			intentEntity.getSnapshot(),
		);

		return { intent: saved };
	}
}
