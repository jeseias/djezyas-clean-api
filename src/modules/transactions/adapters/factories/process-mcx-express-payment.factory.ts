import type {
	MarkOrdersAsPaidByPaymentIntentId,
	MarkOrdersAsPaidByPaymentIntentIdUseCase,
} from "@/src/modules/order/app/use-cases/orders/mark-orders-as-paid-by-payment-intent-id/mark-orders-as-paid-by-payment-intent-id.use-case";
import { ProcessMcxExpressPaymentUseCase } from "../../app/use-cases/process-mcx-express-payment";
import type { PaymentIntentRepository } from "../../domain/repositories/payment-intent.repository";

export const createProcessMcxExpressPaymentUseCase = (
	paymentIntentRepository: PaymentIntentRepository,
	markOrdersAsPaidByPaymentIntentIdUseCase: MarkOrdersAsPaidByPaymentIntentIdUseCase,
): ProcessMcxExpressPaymentUseCase => {
	return new ProcessMcxExpressPaymentUseCase(
		paymentIntentRepository,
		markOrdersAsPaidByPaymentIntentIdUseCase,
	);
};
