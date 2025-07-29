import mongoose, { type Document, Schema } from "mongoose";

export interface ProductTypeDocument extends Document {
	id: string;
	name: string;
	slug: string;
	description?: string;
	organizationId: string;
	productCategoryId: string;
	createdById: string;
	createdAt: Date;
	updatedAt: Date;
}

const productTypeSchema = new Schema<ProductTypeDocument>(
	{
		id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		description: {
			type: String,
			trim: true,
		},
		productCategoryId: {
			type: String,
			required: true,
		},
		organizationId: {
			type: String,
			required: true,
		},
		createdById: {
			type: String,
			required: true,
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

productTypeSchema.index({ id: 1 }, { unique: true });
productTypeSchema.index({ slug: 1 }, { unique: true });
productTypeSchema.index({ organizationId: 1 });
productTypeSchema.index({ createdById: 1 });
productTypeSchema.index({ createdAt: -1 });

// Compound indexes for common queries
productTypeSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
productTypeSchema.index({ organizationId: 1, createdById: 1 });

export const ProductTypeModel = mongoose.model<ProductTypeDocument>(
	"ProductType",
	productTypeSchema,
);
