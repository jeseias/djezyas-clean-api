import mongoose, { type Document, Schema } from "mongoose";

export interface PriceDocument extends Document {
	id: string;
	productId: string;
	currency: string;
	unitAmount: number;
	type: string;
	status: string;
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
		},
		productId: {
			type: String,
			required: true,
			ref: "Product",
		},
		currency: {
			type: String,
			required: true,
		},
		unitAmount: {
			type: Number,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
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
priceSchema.index({ currency: 1 });
priceSchema.index({ status: 1 });
priceSchema.index({ type: 1 });
priceSchema.index({ createdAt: -1 });

priceSchema.index({ productId: 1, currency: 1, status: 1 });
priceSchema.index({ productId: 1, currency: 1, type: 1 });
priceSchema.index({ productId: 1, status: 1 });
priceSchema.index({ productId: 1, type: 1 });
priceSchema.index({ status: 1, validFrom: 1, validUntil: 1 });
priceSchema.index({ validFrom: 1, validUntil: 1 });

export const PriceModel = mongoose.model<PriceDocument>("Price", priceSchema);
