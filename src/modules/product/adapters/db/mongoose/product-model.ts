import mongoose, { type Document, Schema } from "mongoose";
import { Product } from "@/src/modules/product/core/domain/entities";

export interface ProductDocument extends Document {
	id: string;
	name: string;
	slug: string;
	description?: string;
	categoryId: string;
	productTypeId: string;
	status: Product.Status;
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
			unique: true,
		},
		name: {
			type: String,
			required: [true, "Product name is required"],
			trim: true,
			minlength: [2, "Product name must be at least 2 characters long"],
			maxlength: [200, "Product name cannot exceed 200 characters"],
		},
		slug: {
			type: String,
			required: [true, "Product slug is required"],
			unique: true,
			trim: true,
			lowercase: true,
		},
		description: {
			type: String,
			trim: true,
			maxlength: [2000, "Product description cannot exceed 2000 characters"],
		},
		categoryId: {
			type: String,
			required: [true, "Product category ID is required"],
			ref: "ProductCategory",
		},
		productTypeId: {
			type: String,
			required: [true, "Product type ID is required"],
			ref: "ProductType",
		},
		status: {
			type: String,
			enum: Object.values(Product.Status),
			default: Product.Status.DRAFT,
		},
		organizationId: {
			type: String,
			required: [true, "Organization ID is required"],
		},
		createdById: {
			type: String,
			required: [true, "Created by ID is required"],
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
			min: [0, "Weight must be positive"],
		},
		dimensions: {
			length: {
				type: Number,
				min: [0, "Length must be positive"],
			},
			width: {
				type: Number,
				min: [0, "Width must be positive"],
			},
			height: {
				type: Number,
				min: [0, "Height must be positive"],
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
