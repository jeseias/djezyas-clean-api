import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { Product } from "../../../domain/entities";
import type { ProductRepository } from "../../../ports/outbound/product-repository";

export namespace GetProductById {
	export type Params = {
		productId: string;
		userId: string;
	};

	export type Result =
		| Product.Props
		| (Omit<Product.Props, "createdById"> & {
				createdById?: string;
		  });
}

export class GetProductByIdUseCase {
	constructor(private readonly productRepository: ProductRepository) {}

	async execute(params: GetProductById.Params): Promise<GetProductById.Result> {
		const productModel = await this.productRepository.findById(
			params.productId,
		);
		if (!productModel) {
			throw new AppError("Product not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		const product = Product.Entity.fromModel(productModel);
		return product.toJSON();
	}
}
