import { organizationMongooseRepository } from "@/src/modules/organization/adapters/factories/repository.factory";
import type { OrganizationRepository } from "@/src/modules/organization/core/ports/outbound/organization-repository";
import { AddPriceUseCase } from "@/src/modules/product/core/app/usecases/add-price/add-price.use-case";
import { CreateProductUseCase } from "@/src/modules/product/core/app/usecases/create-product/create-product.use-case";
import { CreateProductCategoryUseCase } from "@/src/modules/product/core/app/usecases/create-product-category/create-product-category.use-case";
import { SaveProductTypeUseCase } from "@/src/modules/product/core/app/usecases/save-product-type/save-product-type.use-case";
import { UpdateCurrencyUseCase } from "@/src/modules/product/core/app/usecases/update-currency/update-currency.use-case";
import type { CurrencyRepository } from "@/src/modules/product/core/ports/outbound/currency-repository";
import type { PriceRepository } from "@/src/modules/product/core/ports/outbound/price-repository";
import type { ProductCategoryRepository } from "@/src/modules/product/core/ports/outbound/product-category-repository";
import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import type { ProductTypeRepository } from "@/src/modules/product/core/ports/outbound/product-type-repository";
import { userMongooseRepository } from "@/src/modules/user/adapters/factories/repository.factory";
import type { UserRepository } from "@/src/modules/user/core/ports/outbound/user-repository";
import {
	currencyMongooseRepository,
	priceMongooseRepository,
	productCategoryMongooseRepository,
	productMongooseRepository,
	productTypeMongooseRepository,
} from "./repository.factory";

export class ProductUseCasesFactory {
	constructor(
		private readonly productRepository: ProductRepository,
		private readonly productCategoryRepository: ProductCategoryRepository,
		private readonly productTypeRepository: ProductTypeRepository,
		private readonly userRepository: UserRepository,
		private readonly organizationRepository: OrganizationRepository,
		private readonly priceRepository: PriceRepository,
		private readonly currencyRepository: CurrencyRepository,
	) {}

	createProduct() {
		return new CreateProductUseCase(
			this.productRepository,
			this.userRepository,
			this.organizationRepository,
			this.productCategoryRepository,
			this.productTypeRepository,
		);
	}

	createProductCategory() {
		return new CreateProductCategoryUseCase(this.productCategoryRepository);
	}

	saveProductType() {
		return new SaveProductTypeUseCase(
			this.productTypeRepository,
			this.userRepository,
			this.organizationRepository,
		);
	}

	addPrice() {
		if (!this.priceRepository) {
			throw new Error(
				"AddPrice use case not implemented - missing price repository",
			);
		}
		return new AddPriceUseCase(
			this.priceRepository,
			this.productRepository,
			this.currencyRepository,
		);
	}

	updateCurrency() {
		if (!this.currencyRepository) {
			throw new Error(
				"UpdateCurrency use case not implemented - missing currency repository",
			);
		}
		return new UpdateCurrencyUseCase(this.currencyRepository);
	}
}

export const productUseCasesFactory = new ProductUseCasesFactory(
	productMongooseRepository,
	productCategoryMongooseRepository,
	productTypeMongooseRepository,
	userMongooseRepository,
	organizationMongooseRepository,
	priceMongooseRepository,
	currencyMongooseRepository,
);
