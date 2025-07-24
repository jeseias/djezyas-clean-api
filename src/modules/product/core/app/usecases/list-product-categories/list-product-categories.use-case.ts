import type { ProductCategory } from "../../../domain/entities";
import type { ProductCategoryRepository } from "../../../ports/outbound/product-category-repository";

export namespace ListProductCategories {
	export type Params = {
		page?: number;
		limit?: number;
		sort?: string;
		order?: string;
		search?: string;
	};

	export type Result = {
		items: ProductCategory.Props[];
		totalItems: number;
	};
}

export class ListProductCategoriesUseCase {
	constructor(
		private readonly productCategoryRepository: ProductCategoryRepository,
	) {}

	async execute(
		params: ListProductCategories.Params,
	): Promise<ListProductCategories.Result> {
		const categories = await this.productCategoryRepository.findAll({
			page: params.page,
			limit: params.limit,
			sort: params.sort,
			order: params.order,
			search: params.search,
		});

		return {
			items: categories,
			totalItems: categories.length,
		};
	}
}
