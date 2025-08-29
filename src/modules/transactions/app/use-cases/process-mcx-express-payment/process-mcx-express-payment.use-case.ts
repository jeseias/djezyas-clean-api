import type { MarkOrdersAsPaidByPaymentIntentIdUseCase } from "@/src/modules/order/app/use-cases/orders/mark-orders-as-paid-by-payment-intent-id/mark-orders-as-paid-by-payment-intent-id.use-case";
import { PaymentIntent } from "../../../domain/entities";
import type { PaymentIntentRepository } from "../../../domain/repositories";

export namespace ProcessMcxExpressPayment {
	export type Status = "ACCEPTED" | "REJECTED";

	export type Params = {
		reference: string;
		status: Status;
	};

	export type Result = {
		paymentIntent: PaymentIntent.Model | null;
		ordersUpdated: boolean;
	};
}

export class ProcessMcxExpressPaymentUseCase {
	constructor(
		private readonly paymentIntentRepository: PaymentIntentRepository,
		private readonly markOrdersAsPaidByPaymentIntentIdUseCase: MarkOrdersAsPaidByPaymentIntentIdUseCase,
	) {}

	async execute(
		params: ProcessMcxExpressPayment.Params,
	): Promise<ProcessMcxExpressPayment.Result> {
		const paymentIntent = await this.findPaymentIntentByReference(
			params.reference,
		);

		if (!paymentIntent) {
			return {
				paymentIntent: null,
				ordersUpdated: false,
			};
		}

		const paymentIntentEntity = PaymentIntent.Entity.fromModel(paymentIntent);

		if (params.status === "ACCEPTED") {
			paymentIntentEntity.markSucceeded();
		} else if (params.status === "REJECTED") {
			paymentIntentEntity.markFailed();
		}

		const updatedPaymentIntent = await this.paymentIntentRepository.update(
			paymentIntentEntity.getSnapshot(),
		);

		let ordersUpdated = false;

		if (params.status === "ACCEPTED") {
			try {
				await this.markOrdersAsPaidByPaymentIntentIdUseCase.execute({
					paymentIntentId: updatedPaymentIntent.id,
				});
				ordersUpdated = true;
			} catch (error) {
				console.error("Failed to mark orders as paid:", error);
			}
		}

		return {
			paymentIntent: updatedPaymentIntent,
			ordersUpdated,
		};
	}

	private async findPaymentIntentByReference(
		reference: string,
	): Promise<PaymentIntent.Model | null> {
		const paymentIntent =
			await this.paymentIntentRepository.findByProviderReference(reference);

		if (paymentIntent) {
			return paymentIntent;
		}

		console.log(`Payment intent not found for reference: ${reference}`);
		return null;
	}
}
