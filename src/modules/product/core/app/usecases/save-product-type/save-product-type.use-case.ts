import { Organization } from "@/src/modules/organization/core/domain/entities";
import type { OrganizationRepository } from "@/src/modules/organization/core/ports/outbound/organization-repository";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { User } from "@/src/modules/user/core/domain/entities";
import type { UserRepository } from "@/src/modules/user/core/ports/outbound/user-repository";
import { ProductType } from "../../../domain/entities";
import type { ProductCategoryRepository } from "../../../ports/outbound/product-category-repository";
import type { ProductTypeRepository } from "../../../ports/outbound/product-type-repository";

export namespace SaveProductType {
	export type Params = {
		id?: string;
		name: string;
		description?: string;
		organizationId: string;
		productCategoryId: string;
		userId: string;
	};

	export type Result = ProductType.Props;
}

export class SaveProductTypeUseCase {
	constructor(
		private readonly productTypeRepository: ProductTypeRepository,
		private readonly userRepository: UserRepository,
		private readonly organizationRepository: OrganizationRepository,
		private readonly productCategoryRepository: ProductCategoryRepository,
	) {}

	async execute(
		params: SaveProductType.Params,
	): Promise<SaveProductType.Result> {
		await this.validateUser(params.userId);
		await this.validateOrganization(params.organizationId);
		await this.validateProductCategory(params.productCategoryId);

		if (params.id) {
			return this.updateExistingProductType({ ...params, id: params.id });
		} else {
			return this.createNewProductType(params);
		}
	}

	private async createNewProductType(
		params: SaveProductType.Params,
	): Promise<SaveProductType.Result> {
		const existingProductType = await this.productTypeRepository.findByName(
			params.name,
			params.organizationId,
		);
		if (existingProductType) {
			throw new AppError(
				"Product type with this name already exists in the organization",
				400,
				ErrorCode.PRODUCT_TYPE_ALREADY_EXISTS,
			);
		}

		const productType = ProductType.Entity.create({
			name: params.name,
			description: params.description,
			organizationId: params.organizationId,
			productCategoryId: params.productCategoryId,
			createdById: params.userId,
		});

		await this.productTypeRepository.create(productType.toJSON());

		return productType.toJSON();
	}

	private async updateExistingProductType(
		params: SaveProductType.Params & { id: string },
	): Promise<SaveProductType.Result> {
		const existingProductTypeModel = await this.productTypeRepository.findById(
			params.id,
		);
		if (!existingProductTypeModel) {
			return this.createNewProductType(params);
		}

		const existingProductType = ProductType.Entity.fromModel(
			existingProductTypeModel,
		);

		if (params.name && params.name !== existingProductType.name) {
			const duplicateProductType = await this.productTypeRepository.findByName(
				params.name,
				existingProductType.organizationId,
			);
			if (duplicateProductType && duplicateProductType.id !== params.id) {
				throw new AppError(
					"Product type with this name already exists in the organization",
					400,
					ErrorCode.PRODUCT_TYPE_ALREADY_EXISTS,
				);
			}
		}

		if (params.name) {
			existingProductType.updateName(params.name);
		}
		if (params.description !== undefined) {
			existingProductType.updateDescription(params.description);
		}
		if (params.productCategoryId) {
			existingProductType.updateProductCategory(params.productCategoryId);
		}

		const updatedProductType = existingProductType.toJSON();
		await this.productTypeRepository.update(updatedProductType);

		return updatedProductType;
	}

	private async validateUser(userId: string): Promise<void> {
		const userModel = await this.userRepository.findById(userId);
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
	}

	private async validateOrganization(organizationId: string): Promise<void> {
		const orgProps = await this.organizationRepository.findById(organizationId);
		if (!orgProps) {
			throw new AppError(
				"Organization must exist",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		const org = Organization.Entity.fromModel(orgProps);

		if (org.status !== Organization.Status.ACTIVE) {
			throw new AppError(
				"Organization must be active",
				400,
				ErrorCode.ORGANIZATION_NOT_ACTIVE,
			);
		}
	}

	private async validateProductCategory(
		productCategoryId: string,
	): Promise<void> {
		const productCategoryProps =
			await this.productCategoryRepository.findById(productCategoryId);
		if (!productCategoryProps) {
			throw new AppError(
				"Product category must exist",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}
	}
}
