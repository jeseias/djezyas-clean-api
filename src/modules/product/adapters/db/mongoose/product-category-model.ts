import mongoose, { type Document, Schema } from "mongoose";
import { ProductCategory } from "@/src/modules/product/core/domain/entities";

export interface ProductCategoryDocument extends Document {
	id: string;
	name: string;
	slug: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}

const productCategorySchema = new Schema<ProductCategoryDocument>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
		},
		name: {
			type: String,
			required: [true, "Product category name is required"],
			trim: true,
			minlength: [
				2,
				"Product category name must be at least 2 characters long",
			],
			maxlength: [100, "Product category name cannot exceed 100 characters"],
		},
		slug: {
			type: String,
			required: [true, "Product category slug is required"],
			unique: true,
			trim: true,
			lowercase: true,
		},
		description: {
			type: String,
			trim: true,
			maxlength: [
				500,
				"Product category description cannot exceed 500 characters",
			],
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

productCategorySchema.index({ id: 1 }, { unique: true });
productCategorySchema.index({ slug: 1 }, { unique: true });
productCategorySchema.index({ createdAt: -1 });

export const ProductCategoryModel = mongoose.model<ProductCategoryDocument>(
	"ProductCategory",
	productCategorySchema,
);
