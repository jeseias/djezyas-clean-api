import type { IsOrganizationValidService } from "@/src/modules/organization/core/app/services";
import type { OrganizationMemberRepository } from "@/src/modules/organization/core/ports/outbound/organization-member-repository";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import type { Product } from "../../../domain/entities";
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
		items: Product.Model[];
		totalItems: number;
	};
}

export class FindOrganizationProductsUseCase {
	constructor(
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly productRepository: ProductRepository,
		private readonly organizationMemberRepository: Pick<
			OrganizationMemberRepository,
			"findByUserId"
		>,
	) {}

	async execute(
		params: FindOrganizationProducts.Params,
	): Promise<FindOrganizationProducts.Result> {
		await this.validateUserAccess(params.userId, params.organizationId);

		const filters = params.filters || {};
		return await this.productRepository.findByOrganizationIdWithFilters(
			params.organizationId,
			filters,
		);
	}

	private async validateUserAccess(
		userId: string,
		organizationId: string,
	): Promise<void> {
		await this.isUserValidService.execute(userId);
		await this.isOrganizationValidService.execute(organizationId);

		await this.validateOrganizationMembership(userId, organizationId);
	}

	private async validateOrganizationMembership(
		userId: string,
		organizationId: string,
	): Promise<void> {
		const membership = await this.organizationMemberRepository.findByUserId({
			userId,
			organizationId,
		});
		if (!membership) {
			throw new AppError(
				"User is not a member of the organization",
				403,
				ErrorCode.UNAUTHORIZED,
			);
		}
	}
}
