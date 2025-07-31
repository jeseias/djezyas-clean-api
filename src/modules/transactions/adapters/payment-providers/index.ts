import { MulticaixaExpressPaymentProviderService } from "../../app/services/multicaixa-express-payment-provider.service";
import { MulticaixaExpressClient } from "./multicaixa-express-client";
import { createPaymentProviderRegistry } from "./payment-provider-registry-factory";

export {
	MulticaixaExpressPaymentProviderService,
	MulticaixaExpressClient,
	createPaymentProviderRegistry,
};

export const createMulticaixaExpressPaymentProviderService = (config: {
	requestTokenUrl: string;
	frameToken: string;
	callbackUrl: string;
}) => {
	const client = new MulticaixaExpressClient(config);
	return new MulticaixaExpressPaymentProviderService(client);
};
