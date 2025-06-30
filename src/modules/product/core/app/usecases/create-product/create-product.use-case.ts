import { Organization } from "@/src/modules/organization/core/domain/entities";
import type { OrganizationRepository } from "@/src/modules/organization/core/ports/outbound/organization-repository";
import { AppError } from "@/src/modules/shared/errors";
import { User } from "@/src/modules/user/core/domain/entities";
import type { UserRepository } from "@/src/modules/user/core/ports/outbound/user-repository";
import { Product } from "../../../domain/entities";
import type { ProductCategoryRepository } from "../../../ports/outbound/product-category-repository";
import type { ProductRepository } from "../../../ports/outbound/product-repository";
import type { ProductTypeRepository } from "../../../ports/outbound/product-type-repository";

export namespace CreateProduct {
	export type Params = {
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

	export type Result = Product.Model;
}

export class CreateProductUseCase {
	constructor(
		private readonly productRepository: ProductRepository,
		private readonly userRepository: UserRepository,
		private readonly organizationRepository: OrganizationRepository,
		private readonly productCategoryRepository: ProductCategoryRepository,
		private readonly productTypeRepository: ProductTypeRepository,
	) {}

	async execute(params: CreateProduct.Params): Promise<CreateProduct.Result> {
		const userModel = await this.userRepository.findById(params.createdById);
		if (!userModel) {
			throw new AppError("User must exist", 400);
		}
		const user = User.Entity.fromModel(userModel);

		if (!user.isEmailVerified()) {
			throw new AppError("User must have a verified account", 400);
		}
		if (!user.isActive()) {
			throw new AppError("User account must be active", 400);
		}
		if (user.isBlocked()) {
			throw new AppError("User account is blocked", 400);
		}

		const orgModel = await this.organizationRepository.findById(
			params.organizationId,
		);
		if (!orgModel) {
			throw new AppError("Organization must exist", 400);
		}
		const org = Organization.Entity.fromModel(orgModel);

		if (org.status !== Organization.Status.ACTIVE) {
			throw new AppError("Organization must be active", 400);
		}

		const categoryModel = await this.productCategoryRepository.findById(
			params.categoryId,
		);
		if (!categoryModel) {
			throw new AppError("Product category must exist", 400);
		}

		const productTypeModel = await this.productTypeRepository.findById(
			params.productTypeId,
		);
		if (!productTypeModel) {
			throw new AppError("Product type must exist", 400);
		}
		if (productTypeModel.organizationId !== params.organizationId) {
			throw new AppError("Product type must belong to the organization", 400);
		}

		if (params.sku) {
			const existingProductWithSku = await this.productRepository.findBySku(
				params.sku,
				params.organizationId,
			);
			if (existingProductWithSku) {
				throw new AppError("SKU must be unique within organization", 400);
			}
		}

		if (params.barcode) {
			const existingProductWithBarcode =
				await this.productRepository.findByBarcode(
					params.barcode,
					params.organizationId,
				);
			if (existingProductWithBarcode) {
				throw new AppError("Barcode must be unique within organization", 400);
			}
		}

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
