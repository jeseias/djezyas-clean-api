import { _env } from "@/src/main/config/_env";
import { orderMongooseRepository } from "@/src/modules/order/adapters/factories";
import type { OrderRepository } from "@/src/modules/order/domain/repositories";
import { jwtManager } from "@/src/modules/shared/adapters/factories/service.factory";
import type { TokenManager } from "@/src/modules/shared/ports/outbound/token-manager";
import type { PaymentProviderServiceRegistry } from "../../app/services/payment-provider-service-registry";
import { CreatePaymentIntentUseCase } from "../../app/use-cases/create-payment-intent";
import type { PaymentIntentRepository } from "../../domain/repositories";
import { createPaymentProviderRegistry } from "../payment-providers";
import { paymentIntentMongooseRepository } from "./repository.factory";

export class TransactionUseCases {
	constructor(
		private readonly paymentIntentRepository: PaymentIntentRepository,
		private readonly orderRepository: OrderRepository,
		private readonly providerRegistry: PaymentProviderServiceRegistry,
		private readonly tokenManager: TokenManager,
	) {}

	createCreatePaymentIntentUseCase(): CreatePaymentIntentUseCase {
		return new CreatePaymentIntentUseCase(
			this.paymentIntentRepository,
			this.orderRepository,
			this.providerRegistry,
			this.tokenManager,
		);
	}
}

export const transactionUseCasesFactory = new TransactionUseCases(
	paymentIntentMongooseRepository,
	orderMongooseRepository,
	createPaymentProviderRegistry({
		multicaixaExpress: {
			requestTokenUrl: _env.MCX_EXPRESS_REQUEST_TOKEN_URL,
			frameToken: _env.MCX_EXPRESS_FRAME_TOKEN,
			callbackUrl: _env.MCX_EXPRESS_CALLBACK_URL,
		},
	}),
	jwtManager,
);
