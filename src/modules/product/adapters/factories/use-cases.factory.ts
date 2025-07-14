import {
	isOrganizationMemberService,
	isOrganizationValidService,
} from "@/src/modules/organization/adapters/factories";
import { organizationMongooseRepository } from "@/src/modules/organization/adapters/factories/repository.factory";
import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import type { OrganizationRepository } from "@/src/modules/organization/core/ports/outbound/organization-repository";
import { AddPriceUseCase } from "@/src/modules/product/core/app/usecases/add-price/add-price.use-case";
import { CreateProductCategoryUseCase } from "@/src/modules/product/core/app/usecases/create-product-category/create-product-category.use-case";
import { GetProductByIdUseCase } from "@/src/modules/product/core/app/usecases/get-product-by-id/get-product-by-id.use-case";
import { LoadPricesByProductIdUseCase } from "@/src/modules/product/core/app/usecases/load-prices-by-product-id/load-prices-by-product-id.use-case";
import { SaveCurrencyUseCase } from "@/src/modules/product/core/app/usecases/save-currency/save-currency.use-case";
import { SaveProductUseCase } from "@/src/modules/product/core/app/usecases/save-product/save-product.use-case";
import { SaveProductTypeUseCase } from "@/src/modules/product/core/app/usecases/save-product-type/save-product-type.use-case";
import { UpdatePriceAmountUseCase } from "@/src/modules/product/core/app/usecases/update-price-amount/update-price-amount.use-case";
import { UpdatePriceStatusUseCase } from "@/src/modules/product/core/app/usecases/update-price-status/update-price-status.use-case";
import { UpdateProductStatusUseCase } from "@/src/modules/product/core/app/usecases/update-product-status/update-product-status.use-case";
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
import { ListProductCategoriesUseCase } from "../../core/app/usecases/list-product-categories/list-product-categories.use-case";
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
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
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
			this.isOrganizationMemberService,
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

	listProductCategories() {
		return new ListProductCategoriesUseCase(this.productCategoryRepository);
	}

	getProductById() {
		return new GetProductByIdUseCase(
			this.isUserValidService,
			this.isOrganizationValidService,
			this.isOrganizationMemberService,
			this.productRepository,
		);
	}

	loadPricesByProductId() {
		return new LoadPricesByProductIdUseCase(
			this.isUserValidService,
			this.isOrganizationValidService,
			this.isOrganizationMemberService,
			this.priceRepository,
			this.productRepository,
		);
	}

	updateProductStatus() {
		return new UpdateProductStatusUseCase(
			this.isUserValidService,
			this.isOrganizationValidService,
			this.isOrganizationMemberService,
			this.productRepository,
		);
	}

	updatePriceAmount() {
		return new UpdatePriceAmountUseCase(
			this.isUserValidService,
			this.isOrganizationValidService,
			this.isOrganizationMemberService,
			this.priceRepository,
			this.productRepository,
		);
	}

	updatePriceStatus() {
		return new UpdatePriceStatusUseCase(
			this.isUserValidService,
			this.isOrganizationValidService,
			this.isOrganizationMemberService,
			this.priceRepository,
			this.productRepository,
		);
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
	isOrganizationMemberService,
);
