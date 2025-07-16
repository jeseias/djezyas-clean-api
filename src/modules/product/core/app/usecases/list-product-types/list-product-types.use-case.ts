import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import type { ProductType } from "../../../domain/entities";
import type { ProductTypeRepository } from "../../../ports/outbound/product-type-repository";

export namespace ListProductTypes {
	export type Params = {
		organizationId: string;
		userId: string;
		page?: number;
		limit?: number;
		sort?: string;
		order?: string;
		search?: string;
	};

	export type Result = {
		items: ProductType.Props[];
		totalItems: number;
	};
}

export class ListProductTypesUseCase {
	constructor(
		private readonly productTypeRepository: ProductTypeRepository,
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
	) {}

	async execute(
		params: ListProductTypes.Params,
	): Promise<ListProductTypes.Result> {
		await this.isUserValidService.execute(params.userId);
		await this.isOrganizationValidService.execute(params.organizationId);
		await this.isOrganizationMemberService.execute(
			params.userId,
			params.organizationId,
		);

		const result = await this.productTypeRepository.findByOrganizationId(
			params.organizationId,
			{
				page: params.page,
				limit: params.limit,
				sort: params.sort,
				order: params.order,
				search: params.search,
			},
		);

		return {
			items: result.items.map((item) => item.toJSON()),
			totalItems: result.totalItems,
		};
	}
}
