import mongoose, { type Document, Schema } from "mongoose";
import { Order } from "../../../../domain/entities/order";

export interface OrderDocument extends Document {
	id: string;
	userId: string;
	organizationId: string;
	items: {
		productId: string;
		priceId: string;
		organizationId: string;
		name: string;
		quantity: number;
		unitAmount: number;
		subtotal: number;
		product?: any;
		price?: any;
	}[];
	totalAmount: number;
	status: Order.Status;
	paymentIntentId?: string;
	transactionId?: string;
	paidAt?: Date;
	expiredAt?: Date;
	cancelledAt?: Date;
	meta?: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}

const orderItemSchema = new Schema({
	productId: {
		type: String,
		required: true,
	},
	priceId: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	unitAmount: {
		type: Number,
		required: true,
		min: 0,
	},
	subtotal: {
		type: Number,
		required: true,
		min: 0,
	},
});

const orderSchema = new Schema<OrderDocument>(
	{
		id: {
			type: String,
			required: true,
		},
		userId: {
			type: String,
			required: true,
		},
		organizationId: {
			type: String,
			required: true,
		},
		items: {
			type: [orderItemSchema],
			required: true,
			validate: {
				validator: (items: any[]) => items && items.length > 0,
				message: "Order must have at least one item",
			},
		},
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		status: {
			type: String,
			enum: Object.values(Order.Status),
			default: Order.Status.PENDING,
		},
		paymentIntentId: {
			type: String,
		},
		transactionId: {
			type: String,
		},
		paidAt: {
			type: Date,
		},
		expiredAt: {
			type: Date,
		},
		cancelledAt: {
			type: Date,
		},
		meta: {
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

orderSchema.index({ id: 1 }, { unique: true });
orderSchema.index({ userId: 1 });
orderSchema.index({ organizationId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ transactionId: 1 });
orderSchema.index({ paymentIntentId: 1 });

export const OrderModel = mongoose.model<OrderDocument>("Order", orderSchema);
