import mongoose, { type Document, Schema } from "mongoose";

export interface ProductDocument extends Document {
	id: string;
	name: string;
	slug: string;
	description?: string;
	categoryId: string;
	productTypeId: string;
	status: string;
	organizationId: string;
	createdById: string;
	imageUrl?: string;
	sku?: string;
	barcode?: string;
	weight?: number;
	dimensions?: {
		length: number;
		width: number;
		height: number;
	};
	meta: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
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
		categoryId: {
			type: String,
			required: true,
			ref: "ProductCategory",
		},
		productTypeId: {
			type: String,
			required: true,
			ref: "ProductType",
		},
		status: {
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
		imageUrl: {
			type: String,
			trim: true,
		},
		sku: {
			type: String,
			trim: true,
			uppercase: true,
		},
		barcode: {
			type: String,
			trim: true,
		},
		weight: {
			type: Number,
		},
		dimensions: {
			length: {
				type: Number,
			},
			width: {
				type: Number,
			},
			height: {
				type: Number,
			},
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

productSchema.index({ id: 1 }, { unique: true });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ organizationId: 1 });
productSchema.index({ createdById: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ productTypeId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ createdAt: -1 });

// Compound indexes for common queries
productSchema.index({ organizationId: 1, status: 1 });
productSchema.index({ organizationId: 1, categoryId: 1 });
productSchema.index({ organizationId: 1, productTypeId: 1 });
productSchema.index({ organizationId: 1, createdById: 1 });
productSchema.index({ slug: 1, status: 1 });
productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ productTypeId: 1, status: 1 });

export const ProductModel = mongoose.model<ProductDocument>(
	"Product",
	productSchema,
);
