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
		page?: number;
		sortBy?: "name" | "createdAt" | "updatedAt" | "status";
		sortOrder?: "asc" | "desc";
	};

	export type B2CFilters = {
		status?: Status;
		organizationId?: string;
		categoryId?: string;
		productTypeId?: string;
		search?: string;
		minPrice?: number;
		maxPrice?: number;
		currency?: string;
		limit?: number;
		page?: number;
		sortBy?: "name" | "createdAt" | "updatedAt" | "price";
		sortOrder?: "asc" | "desc";
	};
}

export type ProductRepository = Pick<
	Repository<Product.Props>,
	"create" | "update" | "delete" | "findById"
> & {
	findByOrganizationId(organizationId: string): Promise<Product.Props[]>;
	findBySlug(slug: string): Promise<Product.Props | null>;
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
	findB2CProducts(filters: ProductFilters.B2CFilters): Promise<{
		items: Product.B2CProduct[];
		totalItems: number;
	}>;
	findManyByIds(ids: string[]): Promise<Product.Props[]>;
};
