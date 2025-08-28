import type { Id } from "@/src/modules/shared/value-objects";
import { PaymentIntent } from "../../../../domain/entities/payment-intent.entity";
import type { PaymentIntentRepository } from "../../../../domain/repositories/payment-intent.repository";
import {
	type PaymentIntentDocument,
	PaymentIntentModel,
} from "../models/payment-intent.model";

export class MongoosePaymentIntentRepository
	implements PaymentIntentRepository
{
	async findById(id: Id): Promise<PaymentIntent.Model | null> {
		const paymentIntent = await PaymentIntentModel.findOne({ id }).lean();
		return paymentIntent && this.mapToDomainModel(paymentIntent);
	}

	async findByTransactionId(
		transactionId: string,
	): Promise<PaymentIntent.Model | null> {
		const paymentIntent = await PaymentIntentModel.findOne({
			transactionIds: transactionId,
		}).lean();
		return paymentIntent && this.mapToDomainModel(paymentIntent);
	}

	async findByReference(reference: string): Promise<PaymentIntent.Model[]> {
		const paymentIntents = await PaymentIntentModel.find({
			$or: [{ transactionIds: reference }, { id: reference }],
		}).lean();
		return paymentIntents.map(this.mapToDomainModel);
	}

	async findManyByOrderIds(orderIds: Id[]): Promise<PaymentIntent.Model[]> {
		const paymentIntents = await PaymentIntentModel.find({
			orderIds: { $in: orderIds },
		}).lean();
		return paymentIntents.map(this.mapToDomainModel);
	}

	async create(data: PaymentIntent.Model): Promise<PaymentIntent.Model> {
		const paymentIntentDoc = new PaymentIntentModel(this.mapToPersist(data));
		const savedPaymentIntent = await paymentIntentDoc.save();
		return this.mapToDomainModel(savedPaymentIntent);
	}

	async update(data: PaymentIntent.Model): Promise<PaymentIntent.Model> {
		const updatedPaymentIntent = await PaymentIntentModel.findOneAndUpdate(
			{ id: data.id },
			{ $set: this.mapToPersist(data) },
			{ new: true, runValidators: true },
		);

		if (!updatedPaymentIntent) {
			throw new Error(`PaymentIntent with id ${data.id} not found`);
		}

		return this.mapToDomainModel(updatedPaymentIntent);
	}

	async delete(id: Id): Promise<void> {
		const result = await PaymentIntentModel.deleteOne({ id });
		if (result.deletedCount === 0) {
			throw new Error(`PaymentIntent with id ${id} not found`);
		}
	}

	async findManyPending(): Promise<PaymentIntent.Model[]> {
		const paymentIntents = await PaymentIntentModel.find({
			status: PaymentIntent.Status.PENDING,
		}).lean();
		return paymentIntents.map(this.mapToDomainModel);
	}

	async findExpiredBefore(date: Date): Promise<PaymentIntent.Model[]> {
		const paymentIntents = await PaymentIntentModel.find({
			expiresAt: { $lt: date },
			status: PaymentIntent.Status.PENDING,
		}).lean();
		return paymentIntents.map(this.mapToDomainModel);
	}

	private mapToDomainModel(
		paymentIntentDoc: PaymentIntentDocument,
	): PaymentIntent.Model {
		return {
			id: paymentIntentDoc.id,
			userId: paymentIntentDoc.userId,
			orderIds: paymentIntentDoc.orderIds,
			amount: paymentIntentDoc.amount,
			currency: paymentIntentDoc.currency,
			provider: paymentIntentDoc.provider,
			status: paymentIntentDoc.status,
			transactionIds: paymentIntentDoc.transactionIds,
			expiresAt: paymentIntentDoc.expiresAt,
			metadata: paymentIntentDoc.metadata || {},
			createdAt: paymentIntentDoc.createdAt,
			updatedAt: paymentIntentDoc.updatedAt,
		};
	}

	private mapToPersist(paymentIntent: PaymentIntent.Model) {
		return {
			id: paymentIntent.id,
			userId: paymentIntent.userId,
			orderIds: paymentIntent.orderIds,
			amount: paymentIntent.amount,
			currency: paymentIntent.currency,
			provider: paymentIntent.provider,
			status: paymentIntent.status,
			transactionIds: paymentIntent.transactionIds,
			expiresAt: paymentIntent.expiresAt,
			metadata: paymentIntent.metadata,
			createdAt: paymentIntent.createdAt,
			updatedAt: paymentIntent.updatedAt,
		};
	}
}
