import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import type { OrganizationMember } from "@/src/modules/organization/core/domain/entities/organization-member";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import { Product } from "../../../domain/entities";
import type {
	ProductFilters,
	ProductRepository,
} from "../../../ports/outbound/product-repository";

export namespace FindOrganizationProducts {
	export type Filters = ProductFilters.Filters;

	export type Params = {
		organizationId: string;
		userId: string;
		filters?: Filters;
	};

	export type Result = {
		items: (
			| Product.Props
			| (Omit<Product.Props, "createdById"> & { createdById?: string })
		)[];
		totalItems: number;
	};
}

export class FindOrganizationProductsUseCase {
	constructor(
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly productRepository: ProductRepository,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
	) {}

	async execute(
		params: FindOrganizationProducts.Params,
	): Promise<FindOrganizationProducts.Result> {
		const membership = await this.validateUserAccess(
			params.userId,
			params.organizationId,
		);

		const filters = params.filters || {};
		const result = await this.productRepository.findByOrganizationIdWithFilters(
			params.organizationId,
			filters,
		);

		return {
			items: result.items.map((productModel) => {
				const product = Product.Entity.fromModel(productModel);
				return product.toJSONForRole(membership.role);
			}),
			totalItems: result.totalItems,
		};
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
