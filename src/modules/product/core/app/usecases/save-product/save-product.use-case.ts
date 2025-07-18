import { Organization } from "@/src/modules/organization/core/domain/entities";
import type { OrganizationRepository } from "@/src/modules/organization/core/ports/outbound/organization-repository";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { User } from "@/src/modules/user/core/domain/entities";
import type { UserRepository } from "@/src/modules/user/core/ports/outbound/user-repository";
import { Product } from "../../../domain/entities";
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
	};

	export type Result = Product.Props;
}

export class SaveProductUseCase {
	constructor(
		private readonly productRepository: ProductRepository,
		private readonly userRepository: UserRepository,
		private readonly organizationRepository: OrganizationRepository,
		private readonly productCategoryRepository: ProductCategoryRepository,
		private readonly productTypeRepository: ProductTypeRepository,
	) {}

	async execute(params: SaveProduct.Params): Promise<SaveProduct.Result> {
		const userModel = await this.userRepository.findById(params.createdById);
		if (!userModel) {
			throw new AppError("User must exist", 400, ErrorCode.USER_NOT_FOUND);
		}
		const user = User.Entity.fromModel(userModel);

		if (!user.isEmailVerified()) {
			throw new AppError(
				"User must have a verified account",
				400,
				ErrorCode.EMAIL_NOT_VERIFIED,
			);
		}
		if (!user.isActive()) {
			throw new AppError(
				"User account must be active",
				400,
				ErrorCode.USER_NOT_ACTIVE,
			);
		}
		if (user.isBlocked()) {
			throw new AppError(
				"User account is blocked",
				400,
				ErrorCode.USER_BLOCKED,
			);
		}

		const orgModel = await this.organizationRepository.findById(
			params.organizationId,
		);
		if (!orgModel) {
			throw new AppError(
				"Organization must exist",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}
		const org = Organization.Entity.fromModel(orgModel);

		if (org.status !== Organization.Status.ACTIVE) {
			throw new AppError(
				"Organization must be active",
				400,
				ErrorCode.ORGANIZATION_NOT_ACTIVE,
			);
		}

		const categoryModel = await this.productCategoryRepository.findById(
			params.categoryId,
		);
		if (!categoryModel) {
			throw new AppError(
				"Product category must exist",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		const productTypeModel = await this.productTypeRepository.findById(
			params.productTypeId,
		);
		if (!productTypeModel) {
			throw new AppError(
				"Product type must exist",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}
		if (productTypeModel.organizationId !== params.organizationId) {
			throw new AppError(
				"Product type must belong to the organization",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		const isUpdate = !!params.id;
		let existingProduct: Product.Props | null = null;

		if (isUpdate) {
			existingProduct = await this.productRepository.findById(params.id!);
			if (!existingProduct) {
				throw new AppError(
					"Product not found",
					404,
					ErrorCode.ENTITY_NOT_FOUND,
				);
			}
			if (existingProduct.organizationId !== params.organizationId) {
				throw new AppError(
					"Product does not belong to the organization",
					403,
					ErrorCode.UNAUTHORIZED,
				);
			}
		}

		if (params.sku) {
			const existingProductWithSku = await this.productRepository.findBySku(
				params.sku,
				params.organizationId,
			);
			if (
				existingProductWithSku &&
				(!isUpdate || existingProductWithSku.id !== params.id)
			) {
				throw new AppError(
					"SKU must be unique within organization",
					400,
					ErrorCode.PRODUCT_SKU_ALREADY_EXISTS,
				);
			}
		}

		if (params.barcode) {
			const existingProductWithBarcode =
				await this.productRepository.findByBarcode(
					params.barcode,
					params.organizationId,
				);
			if (
				existingProductWithBarcode &&
				(!isUpdate || existingProductWithBarcode.id !== params.id)
			) {
				throw new AppError(
					"Barcode must be unique within organization",
					400,
					ErrorCode.PRODUCT_BARCODE_ALREADY_EXISTS,
				);
			}
		}

		if (isUpdate) {
			const productEntity = Product.Entity.fromModel(existingProduct!);

			productEntity.updateFromDTO(params);

			await this.productRepository.update(productEntity.toJSON());
			return productEntity.toJSON();
		} else {
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
			return product.toJSON();
		}
	}
}
