import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import type { OrganizationMember } from "@/src/modules/organization/core/domain/entities/organization-member";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import { Product } from "../../../domain/entities";
import type { ProductRepository } from "../../../ports/outbound/product-repository";

export namespace GetProductById {
	export type Params = {
		productId: string;
		userId: string;
	};

	export type Result =
		| Product.Props
		| (Omit<Product.Props, "createdById"> & {
				createdById?: string;
		  });
}

export class GetProductByIdUseCase {
	constructor(
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
		private readonly productRepository: ProductRepository,
	) {}

	async execute(params: GetProductById.Params): Promise<GetProductById.Result> {
		const productModel = await this.productRepository.findById(
			params.productId,
		);
		if (!productModel) {
			throw new AppError("Product not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		const membership = await this.validateUserAccess(
			params.userId,
			productModel.organizationId,
		);

		const product = Product.Entity.fromModel(productModel);
		return product.toJSONForRole(membership.role);
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
