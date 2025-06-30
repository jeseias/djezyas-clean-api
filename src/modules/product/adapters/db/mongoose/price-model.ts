import mongoose, { type Document, Schema } from "mongoose";
import { Price } from "@/src/modules/product/core/domain/entities";

export interface PriceDocument extends Document {
	id: string;
	productId: string;
	currencyId: string;
	amount: number;
	type: Price.Type;
	status: Price.Status;
	validFrom?: Date;
	validUntil?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const priceSchema = new Schema<PriceDocument>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
		},
		productId: {
			type: String,
			required: [true, "Product ID is required"],
			ref: "Product",
		},
		currencyId: {
			type: String,
			required: [true, "Currency ID is required"],
			ref: "Currency",
		},
		amount: {
			type: Number,
			required: [true, "Price amount is required"],
			min: [0, "Price amount must be positive"],
		},
		type: {
			type: String,
			enum: Object.values(Price.Type),
			default: Price.Type.REGULAR,
		},
		status: {
			type: String,
			enum: Object.values(Price.Status),
			default: Price.Status.ACTIVE,
		},
		validFrom: {
			type: Date,
		},
		validUntil: {
			type: Date,
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

priceSchema.index({ id: 1 }, { unique: true });
priceSchema.index({ productId: 1 });
priceSchema.index({ currencyId: 1 });
priceSchema.index({ status: 1 });
priceSchema.index({ type: 1 });
priceSchema.index({ validFrom: 1 });
priceSchema.index({ validUntil: 1 });
priceSchema.index({ createdAt: -1 });

// Compound indexes for common queries
priceSchema.index({ productId: 1, status: 1 });
priceSchema.index({ productId: 1, type: 1 });
priceSchema.index({ productId: 1, currencyId: 1 });
priceSchema.index({ status: 1, validFrom: 1, validUntil: 1 });

export const PriceModel = mongoose.model<PriceDocument>("Price", priceSchema);
