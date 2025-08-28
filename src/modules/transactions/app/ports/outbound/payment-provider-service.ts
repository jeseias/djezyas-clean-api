export namespace PaymentProviderService {
	export type BaseCreateSessionParams = {
		userId: string;
		amount: number;
		orderIds: string[];
    reference: string
		metadata?: Record<string, any>;
	};

	export type ProviderExtraData = {
		[key: string]: Record<string, any> | undefined;
	};

	export type CreateSessionParams = BaseCreateSessionParams & {
		providerExtraData?: ProviderExtraData;
	};

	export type CreateSessionResult = {
		transactionId: string;
		expiresAt?: Date;
		paymentUrl?: string;
	};
}

export type PaymentProviderService = {
	createSession(
		params: PaymentProviderService.CreateSessionParams,
	): Promise<PaymentProviderService.CreateSessionResult>;
};
