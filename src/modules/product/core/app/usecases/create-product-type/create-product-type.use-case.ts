import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import { ProductType } from "../../../domain/entities";
import type { ProductTypeRepository } from "../../../ports/outbound/product-type-repository";

export namespace CreateProductType {
	export type Params = {
		name: string;
		description?: string;
		organizationId: string;
		userId: string;
	};

	export type Result = ProductType.Model;
}

export class CreateProductTypeUseCase {
	constructor(
		private readonly productTypeRepository: ProductTypeRepository,
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
	) {}

	async execute(
		params: CreateProductType.Params,
	): Promise<CreateProductType.Result> {
		await this.isUserValidService.execute(params.userId);
		await this.isOrganizationValidService.execute(params.organizationId);
		await this.isOrganizationMemberService.execute(
			params.userId,
			params.organizationId,
		);
		await this.validateProductTypeName(params.name, params.organizationId);

		const productType = ProductType.Entity.create({
			name: params.name,
			description: params.description,
			organizationId: params.organizationId,
			createdById: params.userId,
		});

		await this.productTypeRepository.create(productType.toJSON());

		return productType.toJSON();
	}

	private async validateProductTypeName(
		name: string,
		organizationId: string,
	): Promise<void> {
		const existingProductType = await this.productTypeRepository.findByName(
			name,
			organizationId,
		);
		if (existingProductType) {
			throw new AppError(
				"Product type with this name already exists in the organization",
				400,
				ErrorCode.PRODUCT_TYPE_ALREADY_EXISTS,
			);
		}
	}
}
