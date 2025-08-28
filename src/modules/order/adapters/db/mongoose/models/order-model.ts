import mongoose, { type Document, Schema } from "mongoose";
import type { Organization } from "@/src/modules/organization/core/domain/entities";
import type { Order } from "../../../../domain/entities/order";

export interface OrderDocument extends Document {
	id: string;
	code: string;
	userId: string;
	organizationId: string;
	items: {
		productId: string;
		priceId: string;
		name: string;
		quantity: number;
		unitAmount: number;
		subtotal: number;
	}[];
	totalAmount: number;
	fulfillmentStatus: Order.FulfillmentStatus;
	paymentStatus: Order.PaymentStatus;
	clientConfirmedIsDelivered: boolean;
	paymentIntentId?: string;
	transactionId?: string;
	paidAt?: Date;
	inDeliveryAt?: Date;
	clientConfirmedDeliveryAt?: Date;
	expiredAt?: Date;
	cancelledAt?: Date;
	meta?: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
	organization: Organization.Model;
}

const orderItemSchema = new Schema({
	productId: {
		type: String,
		required: true,
		ref: "Product",
	},
	priceId: {
		type: String,
		required: true,
		ref: "Price",
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
		code: {
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
		},
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		fulfillmentStatus: {
			type: String,
		},
		paymentStatus: {
			type: String,
		},
		clientConfirmedIsDelivered: {
			type: Boolean,
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
		inDeliveryAt: {
			type: Date,
		},
		clientConfirmedDeliveryAt: {
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
			transform: (_doc, ret) => {
				delete ret.__v;
				delete ret._id;
				return ret;
			},
		},
		toObject: {
			transform: (_doc, ret) => {
				delete ret.__v;
				delete ret._id;
				return ret;
			},
		},
	},
);

orderSchema.index({ id: 1 }, { unique: true });
orderSchema.index({ code: 1 }, { unique: true });
orderSchema.index({ userId: 1 });
orderSchema.index({ organizationId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ transactionId: 1 });
orderSchema.index({ paymentIntentId: 1 });

export const OrderModel = mongoose.model<OrderDocument>("Order", orderSchema);
