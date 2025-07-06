import mongoose, { type Document, Schema } from "mongoose";

export interface CurrencyDocument extends Document {
	id: string;
	code: string;
	name: string;
	symbol: string;
	status: string;
	exchangeRate?: number;
	createdAt: Date;
	updatedAt: Date;
}

const currencySchema = new Schema<CurrencyDocument>(
	{
		id: {
			type: String,
			required: true,
		},
		code: {
			type: String,
			required: true,
			trim: true,
			uppercase: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		symbol: {
			type: String,
			required: true,
			trim: true,
		},
		status: {
			type: String,
			required: true,
		},
		exchangeRate: {
			type: Number,
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

currencySchema.index({ status: 1, code: 1 });

export const CurrencyModel = mongoose.model<CurrencyDocument>(
	"Currency",
	currencySchema,
);
