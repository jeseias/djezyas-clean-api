import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { Price, Product } from "../../../domain/entities";
import type { PriceRepository } from "../../../ports/outbound/price-repository";
import type { ProductRepository } from "../../../ports/outbound/product-repository";

export namespace AddPrice {
	export type Params = {
		productId: string;
		currency: string;
		unitAmount: number;
		type?: Price.Type;
		status?: Price.Status;
		validFrom?: Date;
		validUntil?: Date;
	};

	export type Result = Price.Model;
}

export class AddPriceUseCase {
	constructor(
		private readonly priceRepository: PriceRepository,
		private readonly productRepository: ProductRepository,
	) {}

	async execute(params: AddPrice.Params): Promise<AddPrice.Result> {
		const productModel = await this.productRepository.findById(
			params.productId,
		);
		if (!productModel) {
			throw new AppError("Product must exist", 400, ErrorCode.ENTITY_NOT_FOUND);
		}
		const product = Product.Entity.fromModel(productModel);

		if (!product.isActive()) {
			throw new AppError(
				"Product must be active to add prices",
				400,
				ErrorCode.PRODUCT_NOT_ACTIVE,
			);
		}

		Price.Entity.validateAmount(params.unitAmount);

		const price = Price.Entity.create({
			productId: params.productId,
			unitAmount: params.unitAmount,
			currency: params.currency,
			type: params.type,
			status: params.status,
			validFrom: params.validFrom,
			validUntil: params.validUntil,
		});

		await this.priceRepository.create(price.getSnapshot());

		return price.getSnapshot();
	}
}
