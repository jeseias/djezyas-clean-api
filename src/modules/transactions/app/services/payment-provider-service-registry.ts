import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { PaymentIntent } from "../../domain/entities";
import type { PaymentProviderService } from "../ports/outbound/payment-provider-service";

export class PaymentProviderServiceRegistry {
	private readonly providers: Map<
		PaymentIntent.Provider,
		PaymentProviderService
	>;

	constructor(
		providers: Partial<Record<PaymentIntent.Provider, PaymentProviderService>>,
	) {
		this.providers = new Map(
			Object.entries(providers) as [
				PaymentIntent.Provider,
				PaymentProviderService,
			][],
		);
	}

	get(provider: PaymentIntent.Provider): PaymentProviderService {
		const paymentService = this.providers.get(provider);

		if (!paymentService) {
			throw new AppError(
				`Payment provider '${provider}' is not supported`,
				400,
				ErrorCode.INVALID_INPUT,
			);
		}

		return paymentService;
	}

	has(provider: PaymentIntent.Provider): boolean {
		return this.providers.has(provider);
	}

	getSupportedProviders(): PaymentIntent.Provider[] {
		return Array.from(this.providers.keys());
	}
}
