import { Organization } from "@/src/modules/organization/core/domain/entities";
import type { OrganizationRepository } from "@/src/modules/organization/core/ports/outbound/organization-repository";
import { AppError } from "@/src/modules/shared/errors";
import { User } from "@/src/modules/user/core/domain/entities";
import type { UserRepository } from "@/src/modules/user/core/ports/outbound/user-repository";
import { ProductType } from "../../../domain/entities";
import type { ProductTypeRepository } from "../../../ports/outbound/product-type-repository";

export namespace CreateProductType {
	export type Params = {
		name: string;
		description?: string;
		organizationId: string;
		createdById: string;
	};

	export type Result = ProductType.Model;
}

export class CreateProductTypeUseCase {
	constructor(
		private readonly productTypeRepository: ProductTypeRepository,
		private readonly userRepository: UserRepository,
		private readonly organizationRepository: OrganizationRepository,
	) {}

	async execute(
		params: CreateProductType.Params,
	): Promise<CreateProductType.Result> {
		// Validate user exists and is active
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

		// Validate organization exists and is active
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

		// Check if product type with same slug already exists in the organization
		const slug = ProductType.Entity.create({
			name: params.name,
			description: params.description,
			organizationId: params.organizationId,
			createdById: params.createdById,
		}).slug;

		const existingProductType = await this.productTypeRepository.findBySlug(
			slug.toString(),
			params.organizationId,
		);
		if (existingProductType) {
			throw new AppError(
				"Product type with this name already exists in the organization",
				400,
			);
		}

		const productType = ProductType.Entity.create({
			name: params.name,
			description: params.description,
			organizationId: params.organizationId,
			createdById: params.createdById,
		});

		await this.productTypeRepository.create(productType.toJSON());

		return productType.toJSON();
	}
}
