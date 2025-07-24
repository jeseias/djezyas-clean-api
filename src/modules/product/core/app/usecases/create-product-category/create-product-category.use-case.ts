import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { ProductCategory } from "../../../domain/entities";
import type { ProductCategoryRepository } from "../../../ports/outbound/product-category-repository";

export namespace CreateProductCategory {
	export type Params = {
		name: string;
		description?: string;
	};

	export type Result = ProductCategory.Props;
}

export class CreateProductCategoryUseCase {
	constructor(
		private readonly productCategoryRepository: ProductCategoryRepository,
	) {}

	async execute(
		params: CreateProductCategory.Params,
	): Promise<CreateProductCategory.Result> {
		const slug = ProductCategory.Entity.create({
			name: params.name,
			description: params.description,
		}).slug;

		const existingProductCategory =
			await this.productCategoryRepository.findBySlug(slug.toString());
		if (existingProductCategory) {
			throw new AppError(
				"Product category with this name already exists",
				400,
				ErrorCode.PRODUCT_CATEGORY_ALREADY_EXISTS,
			);
		}

		const productCategory = ProductCategory.Entity.create({
			name: params.name,
			description: params.description,
		});

		await this.productCategoryRepository.create(productCategory.toJSON());

		return productCategory.toJSON();
	}
}
