import mongoose, { type Document, Schema } from "mongoose";

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
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			trim: true,
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
productCategorySchema.index({ name: 1 });
productCategorySchema.index({ createdAt: -1 });

export const ProductCategoryModel = mongoose.model<ProductCategoryDocument>(
	"ProductCategory",
	productCategorySchema,
);
