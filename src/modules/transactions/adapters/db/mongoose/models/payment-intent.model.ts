import mongoose, { type Document, Schema } from "mongoose";
import type { PaymentIntent } from "../../../../domain/entities/payment-intent.entity";

export interface PaymentIntentDocument extends Document {
	id: string;
	userId: string;
	orderIds: string[];
	amount: number;
	provider: PaymentIntent.Provider;
	status: PaymentIntent.Status;
	transactionId?: string;
	expiresAt?: Date;
	metadata?: PaymentIntent.Metadata;
	createdAt: Date;
	updatedAt: Date;
}

const paymentIntentSchema = new Schema<PaymentIntentDocument>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
		},
		userId: {
			type: String,
			required: true,
		},
		orderIds: {
			type: [String],
			required: true,
		},
		amount: {
			type: Number,
			required: true,
			min: 0,
		},
		provider: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
		},
		transactionId: {
			type: String,
			index: true,
		},
		expiresAt: {
			type: Date,
			index: true,
		},
		metadata: {
			type: Schema.Types.Mixed,
			default: {},
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (doc, ret) => {
				delete ret.__v;
				delete ret._id;
				return ret;
			},
		},
		toObject: {
			transform: (doc, ret) => {
				delete ret.__v;
				delete ret._id;
				return ret;
			},
		},
	},
);

// Indexes for better query performance
paymentIntentSchema.index({ id: 1 }, { unique: true });
paymentIntentSchema.index({ userId: 1 });
paymentIntentSchema.index({ orderIds: 1 });
paymentIntentSchema.index({ status: 1 });
paymentIntentSchema.index({ transactionId: 1 });
paymentIntentSchema.index({ expiresAt: 1 });
paymentIntentSchema.index({ createdAt: 1 });

export const PaymentIntentModel = mongoose.model<PaymentIntentDocument>(
	"PaymentIntent",
	paymentIntentSchema,
);
