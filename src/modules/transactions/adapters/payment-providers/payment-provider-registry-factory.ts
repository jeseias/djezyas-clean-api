import type { PaymentProviderService } from "../../app/ports/outbound/payment-provider-service";
import { MulticaixaExpressPaymentProviderService } from "../../app/services/multicaixa-express-payment-provider.service";
import { PaymentProviderServiceRegistry } from "../../app/services/payment-provider-service-registry";
import { PaymentIntent } from "../../domain/entities";
import { MulticaixaExpressClient } from "./multicaixa-express-client";

export const createPaymentProviderRegistry = (config: {
	multicaixaExpress: {
		requestTokenUrl: string;
		frameToken: string;
		callbackUrl: string;
	};
	// Add more provider configs as needed
	// stripe: { ... },
	// afrimoney: { ... },
}): PaymentProviderServiceRegistry => {
	// Create Multicaixa Express provider
	const multicaixaExpressClient = new MulticaixaExpressClient({
		requestTokenUrl: config.multicaixaExpress.requestTokenUrl,
		frameToken: config.multicaixaExpress.frameToken,
		callbackUrl: config.multicaixaExpress.callbackUrl,
	});

	const multicaixaExpressProvider = new MulticaixaExpressPaymentProviderService(
		multicaixaExpressClient,
	);

	// Register all providers
	const providers: Partial<
		Record<PaymentIntent.Provider, PaymentProviderService>
	> = {
		[PaymentIntent.Provider.MULTICAIXA_EXPRESS]: multicaixaExpressProvider,
		// Add more providers as they are implemented
		// [PaymentIntent.Provider.STRIPE]: stripeProvider,
		// [PaymentIntent.Provider.AFRIMONEY]: afrimoneyProvider,
	};

	return new PaymentProviderServiceRegistry(providers);
};
