import type { PaymentProviderService } from "../ports/outbound/payment-provider-service";

namespace MulticaixaExpressRequestPaymentToken {
	export interface Params {
		amount: number;
		reference: string;
	}

	export type Response = Promise<{
		id: string;
		timeToLive: 600000;
	}>;

	export interface Contract {
		requestPaymentToken(
			params: MulticaixaExpressRequestPaymentToken.Params,
		): MulticaixaExpressRequestPaymentToken.Response;
	}
}

export class MulticaixaExpressPaymentProviderService
	implements PaymentProviderService
{
	constructor(
		private readonly multicaixaExpressClient: MulticaixaExpressRequestPaymentToken.Contract,
	) {}

	async createSession(
		params: PaymentProviderService.CreateSessionParams,
	): Promise<PaymentProviderService.CreateSessionResult> {
		const tokenResponse =
			await this.multicaixaExpressClient.requestPaymentToken({
				amount: params.amount,
				reference: params.reference,
			});

		const expiresAt = new Date(Date.now() + tokenResponse.timeToLive);

		const paymentUrl = `https://djezya.com/pay/${tokenResponse.id}`;

		return {
			transactionId: tokenResponse.id,
			expiresAt,
			paymentUrl,
		};
	}
}
