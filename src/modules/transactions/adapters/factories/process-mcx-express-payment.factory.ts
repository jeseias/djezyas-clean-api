import type { MarkOrdersAsPaidByTransactionIdUseCase } from "@/src/modules/order/app/use-cases/orders/mark-orders-as-paid-by-transaction-id/mark-orders-as-paid-by-transaction-id.use-case";
import { ProcessMcxExpressPaymentUseCase } from "../../app/use-cases/process-mcx-express-payment";
import type { PaymentIntentRepository } from "../../domain/repositories/payment-intent.repository";

export const createProcessMcxExpressPaymentUseCase = (
	paymentIntentRepository: PaymentIntentRepository,
	markOrdersAsPaidByTransactionIdUseCase: MarkOrdersAsPaidByTransactionIdUseCase,
): ProcessMcxExpressPaymentUseCase => {
	return new ProcessMcxExpressPaymentUseCase(
		paymentIntentRepository,
		markOrdersAsPaidByTransactionIdUseCase,
	);
};
