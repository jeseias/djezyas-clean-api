import { isOrganizationValidService } from "@/src/modules/organization/adapters/factories";
import {
	organizationMemberMongooseRepository,
	organizationMongooseRepository,
} from "@/src/modules/organization/adapters/factories/repository.factory";
import type { IsOrganizationValidService } from "@/src/modules/organization/core/app/services";
import type { OrganizationMemberRepository } from "@/src/modules/organization/core/ports/outbound/organization-member-repository";
import type { OrganizationRepository } from "@/src/modules/organization/core/ports/outbound/organization-repository";
import { AddPriceUseCase } from "@/src/modules/product/core/app/usecases/add-price/add-price.use-case";
import { CreateProductCategoryUseCase } from "@/src/modules/product/core/app/usecases/create-product-category/create-product-category.use-case";
import { SaveCurrencyUseCase } from "@/src/modules/product/core/app/usecases/save-currency/save-currency.use-case";
import { SaveProductUseCase } from "@/src/modules/product/core/app/usecases/save-product/save-product.use-case";
import { SaveProductTypeUseCase } from "@/src/modules/product/core/app/usecases/save-product-type/save-product-type.use-case";
import type { CurrencyRepository } from "@/src/modules/product/core/ports/outbound/currency-repository";
import type { PriceRepository } from "@/src/modules/product/core/ports/outbound/price-repository";
import type { ProductCategoryRepository } from "@/src/modules/product/core/ports/outbound/product-category-repository";
import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import type { ProductTypeRepository } from "@/src/modules/product/core/ports/outbound/product-type-repository";
import { userMongooseRepository } from "@/src/modules/user/adapters/factories/repository.factory";
import { isUserValidService } from "@/src/modules/user/adapters/factories/service.factory";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import type { UserRepository } from "@/src/modules/user/core/ports/outbound/user-repository";
import { FindOrganizationProductsUseCase } from "../../core/app/usecases/find-products-by-organization/find-products-by-organization.use-case";
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
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly organizationMemberRepository: OrganizationMemberRepository,
	) {}

	saveProduct() {
		return new SaveProductUseCase(
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

	findProductsByOrganization() {
		return new FindOrganizationProductsUseCase(
			this.isUserValidService,
			this.isOrganizationValidService,
			this.productRepository,
			this.organizationMemberRepository,
		);
	}

	addPrice() {
		return new AddPriceUseCase(
			this.priceRepository,
			this.productRepository,
			this.currencyRepository,
		);
	}

	saveCurrency() {
		return new SaveCurrencyUseCase(this.currencyRepository);
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
	isUserValidService,
	isOrganizationValidService,
	organizationMemberMongooseRepository,
);
