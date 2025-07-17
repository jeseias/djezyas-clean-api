import { z } from "zod";
import { Product } from "@/src/modules/product/core/domain/entities";

export const saveProductSchema = z
	.object({
		id: z.string().optional(),
		name: z.string().min(1, "Name is required"),
		description: z.string().optional(),
		categoryId: z.string().min(1, "Category ID is required"),
		productTypeId: z.string().min(1, "Product type ID is required"),
		status: z.nativeEnum(Product.Status).optional(),
		organizationId: z.string().min(1, "Organization ID is required"),
		imageUrl: z.string().url().optional(),
		sku: z.string().optional(),
		barcode: z.string().optional(),
		weight: z.number().positive().optional(),
		dimensions: z
			.object({
				length: z.number().positive(),
				width: z.number().positive(),
				height: z.number().positive(),
			})
			.optional(),
		meta: z.record(z.any()).optional(),
	})
	.strict();

export type SaveProductBody = z.infer<typeof saveProductSchema>;
