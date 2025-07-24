import type { OrganizationRepository } from "@/src/modules/organization/core/ports/outbound/organization-repository";
import { Product } from "../../../domain/entities";
import type {
	ProductFilters,
	ProductRepository,
} from "../../../ports/outbound/product-repository";

export namespace ListB2CProducts {
	export type Filters = {
		storeSlug?: string;
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

	export type Params = {
		filters?: Filters;
	};

	export type Result = {
		items: Product.B2CProduct[];
		totalItems: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export class ListB2CProductsUseCase {
	constructor(
		private readonly productRepository: ProductRepository,
		private readonly organizationRepository: OrganizationRepository,
	) {}

	async execute(
		params: ListB2CProducts.Params,
	): Promise<ListB2CProducts.Result> {
		console.log("reaches here", { params });
		const filters = params.filters || {};
		const { limit = 20, page = 1 } = filters;

		let organizationId: string | undefined;
		if (filters.storeSlug) {
			const organization = await this.organizationRepository.findBySlug(
				filters.storeSlug,
			);
			if (!organization) {
				return {
					items: [],
					totalItems: 0,
					page,
					limit,
					totalPages: 0,
				};
			}
			organizationId = organization.id;
		}

		const repositoryFilters: ProductFilters.B2CFilters = {
			status: Product.Status.ACTIVE,
			organizationId,
			categoryId: filters.categoryId,
			productTypeId: filters.productTypeId,
			search: filters.search,
			minPrice: filters.minPrice,
			maxPrice: filters.maxPrice,
			currency: filters.currency,
			limit,
			page,
			sortBy: filters.sortBy,
			sortOrder: filters.sortOrder,
		};

		const result =
			await this.productRepository.findB2CProducts(repositoryFilters);

		const totalPages = Math.ceil(result.totalItems / limit);

		return {
			items: result.items,
			totalItems: result.totalItems,
			page,
			limit,
			totalPages,
		};
	}
}
