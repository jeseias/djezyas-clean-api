import mongoose, { type Document, Schema } from "mongoose";
import { Currency } from "@/src/modules/product/core/domain/entities";

export interface CurrencyDocument extends Document {
	id: string;
	code: string;
	name: string;
	symbol: string;
	status: Currency.Status;
	exchangeRate?: number;
	createdAt: Date;
	updatedAt: Date;
}

const currencySchema = new Schema<CurrencyDocument>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
		},
		code: {
			type: String,
			required: [true, "Currency code is required"],
			unique: true,
			trim: true,
			uppercase: true,
			minlength: [3, "Currency code must be 3 characters"],
			maxlength: [3, "Currency code must be 3 characters"],
		},
		name: {
			type: String,
			required: [true, "Currency name is required"],
			trim: true,
			minlength: [2, "Currency name must be at least 2 characters long"],
			maxlength: [100, "Currency name cannot exceed 100 characters"],
		},
		symbol: {
			type: String,
			required: [true, "Currency symbol is required"],
			trim: true,
			maxlength: [10, "Currency symbol cannot exceed 10 characters"],
		},
		status: {
			type: String,
			enum: Object.values(Currency.Status),
			default: Currency.Status.ACTIVE,
		},
		exchangeRate: {
			type: Number,
			min: [0, "Exchange rate must be positive"],
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

currencySchema.index({ id: 1 }, { unique: true });
currencySchema.index({ code: 1 }, { unique: true });
currencySchema.index({ status: 1 });
currencySchema.index({ createdAt: -1 });

// Compound indexes for common queries
currencySchema.index({ status: 1, code: 1 });

export const CurrencyModel = mongoose.model<CurrencyDocument>(
	"Currency",
	currencySchema,
);
