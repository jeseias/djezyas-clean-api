import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { Product } from "../../domain/entities/product";

export type ProductRepository = Pick<
	Repository<Product.Model>,
	"create" | "update" | "delete" | "findById"
> & {
	findByOrganizationId(organizationId: string): Promise<Product.Model[]>;
	findBySlug(slug: string): Promise<Product.Model | null>;
	findBySku(sku: string, organizationId: string): Promise<Product.Model | null>;
	findByBarcode(
		barcode: string,
		organizationId: string,
	): Promise<Product.Model | null>;
	findByCategoryId(categoryId: string): Promise<Product.Model[]>;
	findByProductTypeId(productTypeId: string): Promise<Product.Model[]>;
	findByOrganizationIdAndCategoryId(
		organizationId: string,
		categoryId: string,
	): Promise<Product.Model[]>;
	findByOrganizationIdAndProductTypeId(
		organizationId: string,
		productTypeId: string,
	): Promise<Product.Model[]>;
};
