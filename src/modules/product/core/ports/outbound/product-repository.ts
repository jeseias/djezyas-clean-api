import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { Product } from "../../domain/entities/product";

export namespace ProductFilters {
	export type Status = Product.Status;

	export type Filters = {
		status?: Status;
		categoryId?: string;
		productTypeId?: string;
		search?: string;
		hasSku?: boolean;
		hasBarcode?: boolean;
		hasImage?: boolean;
		createdAfter?: Date;
		createdBefore?: Date;
		updatedAfter?: Date;
		updatedBefore?: Date;
		limit?: number;
		offset?: number;
		sortBy?: "name" | "createdAt" | "updatedAt" | "status";
		sortOrder?: "asc" | "desc";
	};
}

export type ProductRepository = Pick<
	Repository<Product.Props>,
	"create" | "update" | "delete" | "findById"
> & {
	findByOrganizationId(organizationId: string): Promise<Product.Props[]>;
	findBySlug(slug: string): Promise<Product.Props | null>;
	findBySku(sku: string, organizationId: string): Promise<Product.Props | null>;
	findByBarcode(
		barcode: string,
		organizationId: string,
	): Promise<Product.Props | null>;
	findByCategoryId(categoryId: string): Promise<Product.Props[]>;
	findByProductTypeId(productTypeId: string): Promise<Product.Props[]>;
	findByOrganizationIdAndCategoryId(
		organizationId: string,
		categoryId: string,
	): Promise<Product.Props[]>;
	findByOrganizationIdAndProductTypeId(
		organizationId: string,
		productTypeId: string,
	): Promise<Product.Props[]>;
	findByOrganizationIdWithFilters(
		organizationId: string,
		filters: ProductFilters.Filters,
	): Promise<{
		items: Product.Props[];
		totalItems: number;
	}>;
};
