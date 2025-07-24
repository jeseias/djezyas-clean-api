import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import { Price, Product } from "../../../domain/entities";
import type { PriceRepository } from "../../../ports/outbound/price-repository";
import type { ProductCategoryRepository } from "../../../ports/outbound/product-category-repository";
import type { ProductRepository } from "../../../ports/outbound/product-repository";
import type { ProductTypeRepository } from "../../../ports/outbound/product-type-repository";

export namespace SaveProduct {
	export type Params = {
		id?: string;
		name: string;
		description?: string;
		categoryId: string;
		productTypeId: string;
		status?: Product.Status;
		organizationId: string;
		createdById: string;
		imageUrl?: string;
		sku?: string;
		barcode?: string;
		weight?: number;
		dimensions?: {
			length: number;
			width: number;
			height: number;
		};
		meta?: Record<string, unknown>;
		price: {
			currency: string;
			unitAmount: number;
			type?: Price.Type;
			status?: Price.Status;
			validFrom?: Date;
			validUntil?: Date;
		};
	};

	export type Result = Product.Props;
}

export class SaveProductUseCase {
	constructor(
		private readonly productRepository: ProductRepository,
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValid: IsOrganizationValidService,
		private readonly isMember: IsOrganizationMemberService,
		private readonly productCategoryRepository: ProductCategoryRepository,
		private readonly productTypeRepository: ProductTypeRepository,
		private readonly priceRepository: PriceRepository,
	) {}

	async execute(params: SaveProduct.Params): Promise<SaveProduct.Result> {
		await this.isUserValidService.execute(params.createdById);
		await this.isOrganizationValid.execute(params.organizationId);
		await this.isMember.execute(params.createdById, params.organizationId);

		await this.validateProductCategory(params.categoryId);
		await this.validateProductType(params.productTypeId, params.organizationId);

		let existingProduct: Product.Props | null = null;

		if (params.id) {
			existingProduct = await this.validateExistingProduct(
				params.id,
				params.organizationId,
			);
		}

		if (existingProduct) {
			return await this.updateProduct(existingProduct, params);
		} else {
			return await this.createProduct(params);
		}
	}

	private async validateProductCategory(categoryId: string): Promise<void> {
		const categoryModel =
			await this.productCategoryRepository.findById(categoryId);
		if (!categoryModel) {
			throw new AppError(
				"Product category must exist",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}
	}

	private async validateProductType(
		productTypeId: string,
		organizationId: string,
	): Promise<void> {
		const productTypeModel =
			await this.productTypeRepository.findById(productTypeId);
		if (!productTypeModel) {
			throw new AppError(
				"Product type must exist",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}
		if (productTypeModel.organizationId !== organizationId) {
			throw new AppError(
				"Product type must belong to the organization",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}
	}

	private async validateExistingProduct(
		productId: string,
		organizationId: string,
	): Promise<Product.Props> {
		const existingProduct = await this.productRepository.findById(productId);
		if (!existingProduct) {
			throw new AppError("Product not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}
		if (existingProduct.organizationId !== organizationId) {
			throw new AppError(
				"Product does not belong to the organization",
				403,
				ErrorCode.UNAUTHORIZED,
			);
		}
		return existingProduct;
	}

	private async updateProduct(
		existingProduct: Product.Props,
		params: SaveProduct.Params,
	): Promise<Product.Props> {
		const productEntity = Product.Entity.fromModel(existingProduct);
		productEntity.updateFromDTO(params);

		await this.productRepository.update(productEntity.toJSON());
    const price = await this.priceRepository.findByProductId(productEntity.id)

		return {
      ...productEntity.toJSON(),
      price: price?.[0]
    };
	}

	private async createProduct(
		params: SaveProduct.Params,
	): Promise<Product.Props> {
		const product = Product.Entity.create({
			name: params.name,
			description: params.description,
			categoryId: params.categoryId,
			productTypeId: params.productTypeId,
			status: params.status,
			organizationId: params.organizationId,
			createdById: params.createdById,
			imageUrl: params.imageUrl,
			sku: params.sku,
			barcode: params.barcode,
			weight: params.weight,
			dimensions: params.dimensions,
			meta: params.meta,
		});

		await this.productRepository.create(product.toJSON());
		const price = await this.createProductPrice(product.id, params.price);

		return {
      ...product.toJSON(),
      price
    };
	}

	private async createProductPrice(
		productId: string,
		priceParams: SaveProduct.Params["price"],
	): Promise<Price.Model> {
		const price = Price.Entity.create({
			productId,
			currency: priceParams.currency,
			unitAmount: priceParams.unitAmount,
			type: priceParams.type,
			status: priceParams.status,
			validFrom: priceParams.validFrom,
			validUntil: priceParams.validUntil,
		});

		await this.priceRepository.create(price.getSnapshot());

    return price.getSnapshot()
	}
}
