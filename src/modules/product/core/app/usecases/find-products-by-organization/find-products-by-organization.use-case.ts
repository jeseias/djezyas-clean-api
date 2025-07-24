import { Product } from "../../../domain/entities";
import type {
	ProductFilters,
	ProductRepository,
} from "../../../ports/outbound/product-repository";

export namespace FindOrganizationProducts {
	export type Filters = ProductFilters.Filters;

	export type Params = {
		organizationId: string;
		userId: string;
		filters?: Filters;
	};

	export type Result = {
		items: Array<Product.Props>;
		totalItems: number;
	};
}

export class FindOrganizationProductsUseCase {
	constructor(private readonly productRepository: ProductRepository) {}

	async execute(
		params: FindOrganizationProducts.Params,
	): Promise<FindOrganizationProducts.Result> {
		const filters = params.filters || {};
		const result = await this.productRepository.findByOrganizationIdWithFilters(
			params.organizationId,
			filters,
		);

		return {
			items: result.items.map((productModel) => {
				const product = Product.Entity.fromModel(productModel);
				return product.toJSON();
			}),
			totalItems: result.totalItems,
		};
	}
}
