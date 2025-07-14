import type {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "@/src/modules/organization/core/app/services";
import type { OrganizationMember } from "@/src/modules/organization/core/domain/entities/organization-member";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { IsUserValidService } from "@/src/modules/user/core/app/services";
import { Price } from "../../../domain/entities";
import type { PriceRepository } from "../../../ports/outbound/price-repository";
import type { ProductRepository } from "../../../ports/outbound/product-repository";

export namespace LoadPricesByProductId {
	export type Params = {
		productId: string;
		userId: string;
	};

	export type Result = Price.Model[];
}

export class LoadPricesByProductIdUseCase {
	constructor(
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
		private readonly priceRepository: PriceRepository,
		private readonly productRepository: ProductRepository,
	) {}

	async execute(params: LoadPricesByProductId.Params): Promise<LoadPricesByProductId.Result> {
		const productModel = await this.productRepository.findById(params.productId);
		if (!productModel) {
			throw new AppError("Product not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		// Validate user access to the organization
		await this.validateUserAccess(params.userId, productModel.organizationId);

		// Load all prices for the product
		const prices = await this.priceRepository.findByProductId(params.productId);

		return prices;
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