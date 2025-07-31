import axios from "axios";

// Generate payment reference with DJEZ prefix
export function generatePaymentReference(
	length: number = 15,
	prefix: string = "DJEZ",
): string {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const randomLength = length - prefix.length;
	let randomString = "";

	for (let i = 0; i < randomLength; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		randomString += characters[randomIndex];
	}

	return prefix + randomString;
}

// Real Multicaixa Express client implementation
export class MulticaixaExpressClient {
	constructor(
		private readonly config: {
			requestTokenUrl: string;
			frameToken: string;
			callbackUrl: string;
		},
	) {}

	async requestPaymentToken(params: {
		amount: number;
		reference: string;
	}): Promise<{
		id: string;
		timeToLive: 600000;
	}> {
		try {
			const reference = params.reference;
			const response = await axios.post(this.config.requestTokenUrl, {
				reference,
				amount: params.amount,
				token: this.config.frameToken,
				qrCode: "PAYMENT",
				mobile: "PAYMENT",
				card: "DISABLED",
				// card: "PAYMENT",
				cssUrl: "",
				callbackUrl: this.config.callbackUrl,
			});

			return { ...response.data, reference };
		} catch (error) {
			console.log(error);
			throw new Error(
				`Multicaixa Express API error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
