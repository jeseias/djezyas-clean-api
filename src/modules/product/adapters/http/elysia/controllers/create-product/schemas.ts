import { z } from "zod";
import { Price, Product } from "@/src/modules/product/core/domain/entities";

export const saveProductSchema = z
	.object({
		id: z.string().optional(),
		name: z.string().min(1, "Name is required"),
		description: z.string().optional(),
		// categoryId: z.string().min(1, "Category ID is required").uuid(),
		productTypeId: z.string().min(1, "Product type ID is required").uuid(),
		status: z.nativeEnum(Product.Status).optional(),
		organizationId: z.string().min(1, "Organization ID is required").uuid(),
		imageUrl: z.string().url().optional(),
		sku: z.string().optional(),
		barcode: z.string().optional(),
		weight: z.coerce.number().optional(),
		dimensions: z
			.object({
				length: z.coerce.number().positive(),
				width: z.coerce.number().positive(),
				height: z.coerce.number().positive(),
			})
			.optional(),
		meta: z.record(z.any()).optional(),
		price: z.object({
			currency: z.string().min(3, "Currency is required"),
			unitAmount: z.coerce.number().positive("Unit amount must be positive"),
			type: z.nativeEnum(Price.Type).optional(),
			status: z.nativeEnum(Price.Status).optional(),
			validFrom: z.date().optional(),
			validUntil: z.date().optional(),
		}),
	})
	.strict();

export type SaveProductBody = z.infer<typeof saveProductSchema>;
