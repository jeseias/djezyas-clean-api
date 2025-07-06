import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { Currency, Price, Product } from "../../../domain/entities";
import type { CurrencyRepository } from "../../../ports/outbound/currency-repository";
import type { PriceRepository } from "../../../ports/outbound/price-repository";
import type { ProductRepository } from "../../../ports/outbound/product-repository";

export namespace AddPrice {
	export type Params = {
		productId: string;
		currencyId: string;
		amount: number;
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
		private readonly currencyRepository: CurrencyRepository,
	) {}

	async execute(params: AddPrice.Params): Promise<AddPrice.Result> {
		const productModel = await this.productRepository.findById(
			params.productId,
		);
		if (!productModel) {
			throw new AppError("Product must exist", 400, ErrorCode.ENTITY_NOT_FOUND);
		}
		const product = Product.Entity.fromModel(productModel);

		if (product.status !== Product.Status.ACTIVE) {
			throw new AppError(
				"Product must be active to add prices",
				400,
				ErrorCode.PRODUCT_NOT_ACTIVE,
			);
		}

		const currencyModel = await this.currencyRepository.findById(
			params.currencyId,
		);
		if (!currencyModel) {
			throw new AppError(
				"Currency must exist",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}
		const currency = Currency.Entity.fromModel(currencyModel);

		if (currency.status !== Currency.Status.ACTIVE) {
			throw new AppError(
				"Currency must be active",
				400,
				ErrorCode.CURRENCY_NOT_ACTIVE,
			);
		}

		if (params.amount <= 0) {
			throw new AppError(
				"Price amount must be positive",
				400,
				ErrorCode.INVALID_PRICE,
			);
		}

		const existingPrices =
			await this.priceRepository.findByProductIdAndCurrencyId(
				params.productId,
				params.currencyId,
			);

		const hasActivePrice = existingPrices.some((price) => {
			const priceEntity = Price.Entity.fromModel(price);
			return (
				priceEntity.isValid() &&
				priceEntity.type === (params.type ?? Price.Type.REGULAR)
			);
		});

		if (hasActivePrice) {
			throw new AppError(
				`Active ${params.type ?? Price.Type.REGULAR} price already exists for this product and currency`,
				400,
				ErrorCode.PRICE_ALREADY_EXISTS,
			);
		}

		const price = Price.Entity.create({
			productId: params.productId,
			currencyId: params.currencyId,
			amount: params.amount,
			type: params.type,
			status: params.status,
			validFrom: params.validFrom,
			validUntil: params.validUntil,
		});

		await this.priceRepository.create(price.toJSON());

		return price.toJSON();
	}
}
