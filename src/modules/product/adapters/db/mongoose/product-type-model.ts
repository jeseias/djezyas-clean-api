import mongoose, { type Document, Schema } from "mongoose";
import { ProductType } from "@/src/modules/product/core/domain/entities";

export interface ProductTypeDocument extends Document {
	id: string;
	name: string;
	slug: string;
	description?: string;
	organizationId: string;
	createdById: string;
	createdAt: Date;
	updatedAt: Date;
}

const productTypeSchema = new Schema<ProductTypeDocument>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
		},
		name: {
			type: String,
			required: [true, "Product type name is required"],
			trim: true,
			minlength: [2, "Product type name must be at least 2 characters long"],
			maxlength: [100, "Product type name cannot exceed 100 characters"],
		},
		slug: {
			type: String,
			required: [true, "Product type slug is required"],
			unique: true,
			trim: true,
			lowercase: true,
		},
		description: {
			type: String,
			trim: true,
			maxlength: [500, "Product type description cannot exceed 500 characters"],
		},
		organizationId: {
			type: String,
			required: [true, "Organization ID is required"],
		},
		createdById: {
			type: String,
			required: [true, "Created by ID is required"],
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
productTypeSchema.index({ organizationId: 1, slug: 1 });
productTypeSchema.index({ organizationId: 1, createdById: 1 });

export const ProductTypeModel = mongoose.model<ProductTypeDocument>(
	"ProductType",
	productTypeSchema,
);
