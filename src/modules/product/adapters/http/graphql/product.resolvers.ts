import type { AddPrice } from "../../../core/app/usecases/add-price/add-price.use-case";
import type { CreateProduct } from "../../../core/app/usecases/create-product/create-product.use-case";
import type { CreateProductCategory } from "../../../core/app/usecases/create-product-category/create-product-category.use-case";
import type { SaveProductType } from "../../../core/app/usecases/save-product-type/save-product-type.use-case";
import type { UpdateCurrency } from "../../../core/app/usecases/update-currency/update-currency.use-case";
import {
	currencyMongooseRepository,
	priceMongooseRepository,
	productCategoryMongooseRepository,
	productMongooseRepository,
	productTypeMongooseRepository,
} from "../../factories/repository.factory";
import { productUseCasesFactory } from "../../factories/use-cases.factory";

export const productResolvers = {
	Query: {
		products: async (
			_: unknown,
			{ organizationId }: { organizationId: string },
		) => {
			try {
				const products =
					await productMongooseRepository.findByOrganizationId(organizationId);
				return products;
			} catch (error) {
				console.error("Error fetching products:", error);
				return [];
			}
		},
		product: async (_: unknown, { id }: { id: string }) => {
			try {
				const product = await productMongooseRepository.findById(id);
				return product;
			} catch (error) {
				console.error("Error fetching product:", error);
				return null;
			}
		},
		productBySlug: async (_: unknown, { slug }: { slug: string }) => {
			try {
				const product = await productMongooseRepository.findBySlug(slug);
				return product;
			} catch (error) {
				console.error("Error fetching product by slug:", error);
				return null;
			}
		},
		productsByCategory: async (
			_: unknown,
			{ categoryId }: { categoryId: string },
		) => {
			try {
				const products =
					await productMongooseRepository.findByCategoryId(categoryId);
				return products;
			} catch (error) {
				console.error("Error fetching products by category:", error);
				return [];
			}
		},
		productsByType: async (
			_: unknown,
			{ productTypeId }: { productTypeId: string },
		) => {
			try {
				const products =
					await productMongooseRepository.findByProductTypeId(productTypeId);
				return products;
			} catch (error) {
				console.error("Error fetching products by type:", error);
				return [];
			}
		},
		productCategories: async () => {
			try {
				const categories = await productCategoryMongooseRepository.findAll();
				return categories;
			} catch (error) {
				console.error("Error fetching product categories:", error);
				return [];
			}
		},
		productCategory: async (_: unknown, { id }: { id: string }) => {
			try {
				const category = await productCategoryMongooseRepository.findById(id);
				return category;
			} catch (error) {
				console.error("Error fetching product category:", error);
				return null;
			}
		},
		productCategoryBySlug: async (_: unknown, { slug }: { slug: string }) => {
			try {
				const category =
					await productCategoryMongooseRepository.findBySlug(slug);
				return category;
			} catch (error) {
				console.error("Error fetching product category by slug:", error);
				return null;
			}
		},
		productTypes: async (
			_: unknown,
			{ organizationId }: { organizationId: string },
		) => {
			try {
				const productTypes =
					await productTypeMongooseRepository.findByOrganizationId(
						organizationId,
					);
				return productTypes;
			} catch (error) {
				console.error("Error fetching product types:", error);
				return [];
			}
		},
		productType: async (_: unknown, { id }: { id: string }) => {
			try {
				const productType = await productTypeMongooseRepository.findById(id);
				return productType;
			} catch (error) {
				console.error("Error fetching product type:", error);
				return null;
			}
		},
		productTypeBySlug: async (
			_: unknown,
			{ slug, organizationId }: { slug: string; organizationId: string },
		) => {
			try {
				const productType = await productTypeMongooseRepository.findBySlug(
					slug,
					organizationId,
				);
				return productType;
			} catch (error) {
				console.error("Error fetching product type by slug:", error);
				return null;
			}
		},
		prices: async (_: unknown, { productId }: { productId: string }) => {
			try {
				const prices = await priceMongooseRepository.findByProductId(productId);
				return prices;
			} catch (error) {
				console.error("Error fetching prices:", error);
				return [];
			}
		},
		currencies: async () => {
			try {
				const currencies = await currencyMongooseRepository.findActive();
				return currencies;
			} catch (error) {
				console.error("Error fetching currencies:", error);
				return [];
			}
		},
		currency: async (_: unknown, { id }: { id: string }) => {
			try {
				const currency = await currencyMongooseRepository.findById(id);
				return currency;
			} catch (error) {
				console.error("Error fetching currency:", error);
				return null;
			}
		},
		currencyByCode: async (_: unknown, { code }: { code: string }) => {
			try {
				const currency = await currencyMongooseRepository.findByCode(code);
				return currency;
			} catch (error) {
				console.error("Error fetching currency by code:", error);
				return null;
			}
		},
	},
	Mutation: {
		createProduct: async (
			_: unknown,
			{ input }: { input: CreateProduct.Params },
			context: { user?: { id: string } },
		) => {
			try {
				if (!context.user?.id) {
					return {
						success: false,
						product: null,
						error: "Authentication required",
					};
				}

				const createProductUseCase = productUseCasesFactory.createProduct();
				const product = await createProductUseCase.execute({
					...input,
					createdById: context.user.id,
				});

				return {
					success: true,
					product,
					error: null,
				};
			} catch (error) {
				return {
					success: false,
					product: null,
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		},

		createProductCategory: async (
			_: unknown,
			{ input }: { input: CreateProductCategory.Params },
		) => {
			try {
				const createProductCategoryUseCase =
					productUseCasesFactory.createProductCategory();
				const productCategory =
					await createProductCategoryUseCase.execute(input);

				return {
					success: true,
					productCategory,
					error: null,
				};
			} catch (error) {
				return {
					success: false,
					productCategory: null,
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		},

		saveProductType: async (
			_: unknown,
			{ input }: { input: SaveProductType.Params },
			context: { user?: { id: string } },
		) => {
			try {
				if (!context.user?.id) {
					return {
						success: false,
						productType: null,
						error: "Authentication required",
					};
				}

				const saveProductTypeUseCase = productUseCasesFactory.saveProductType();
				const productType = await saveProductTypeUseCase.execute({
					...input,
					userId: context.user.id,
				});

				return {
					success: true,
					productType,
					error: null,
				};
			} catch (error) {
				return {
					success: false,
					productType: null,
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		},

		addPrice: async (_: unknown, { input }: { input: AddPrice.Params }) => {
			try {
				const addPriceUseCase = productUseCasesFactory.addPrice();
				const price = await addPriceUseCase.execute(input);

				return {
					success: true,
					price,
					error: null,
				};
			} catch (error) {
				return {
					success: false,
					price: null,
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		},

		updateCurrency: async (
			_: unknown,
			{ input }: { input: UpdateCurrency.Params },
		) => {
			try {
				const updateCurrencyUseCase = productUseCasesFactory.updateCurrency();
				const currency = await updateCurrencyUseCase.execute(input);

				return {
					success: true,
					currency,
					error: null,
				};
			} catch (error) {
				return {
					success: false,
					currency: null,
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		},
	},
};
