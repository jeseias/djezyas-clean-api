import type { Id } from "@/src/modules/shared/value-objects";
import type { PaymentIntent } from "../entities/payment-intent.entity";

export interface PaymentIntentRepository {
	findById(id: Id): Promise<PaymentIntent.Model | null>;
	findByProviderReference(
		reference: string,
	): Promise<PaymentIntent.Model | null>;
	findByTransactionId(
		transactionId: string,
	): Promise<PaymentIntent.Model | null>;
	findByReference(reference: string): Promise<PaymentIntent.Model[]>;
	findManyByOrderIds(orderIds: Id[]): Promise<PaymentIntent.Model[]>;
	create(data: PaymentIntent.Model): Promise<PaymentIntent.Model>;
	update(data: PaymentIntent.Model): Promise<PaymentIntent.Model>;
	delete(id: Id): Promise<void>;
	findManyPending(): Promise<PaymentIntent.Model[]>;
	findExpiredBefore(date: Date): Promise<PaymentIntent.Model[]>;
}
