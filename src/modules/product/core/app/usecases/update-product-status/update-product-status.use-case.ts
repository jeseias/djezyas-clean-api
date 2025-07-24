import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import type { OrganizationMember } from "@/src/modules/organization/core/domain/entities/organization-member";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import { Product } from "../../../domain/entities";
import type { ProductRepository } from "../../../ports/outbound/product-repository";

export namespace UpdateProductStatus {
	export type Params = {
		productId: string;
		status: Product.Status;
		userId: string;
	};

	export type Result = Product.Props;
}

export class UpdateProductStatusUseCase {
	constructor(
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
		private readonly productRepository: ProductRepository,
	) {}

	async execute(
		params: UpdateProductStatus.Params,
	): Promise<UpdateProductStatus.Result> {
		const productModel = await this.productRepository.findById(
			params.productId,
		);
		if (!productModel) {
			throw new AppError("Product not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		await this.validateUserAccess(params.userId, productModel.organizationId);

		const product = Product.Entity.fromModel(productModel);

		product.updateStatus(params.status);

		await this.productRepository.update(product.toJSON());

		return product.toJSON();
	}

	private async validateUserAccess(
		userId: string,
		organizationId: string,
	): Promise<OrganizationMember.Model> {
		await this.isUserValidService.execute(userId);
		await this.isOrganizationValidService.execute(organizationId);

		return await this.isOrganizationMemberService.execute(
			userId,
			organizationId,
		);
	}
}
