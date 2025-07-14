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

export namespace UpdatePriceStatus {
	export type Params = {
		priceId: string;
		status: Price.Status;
		userId: string;
	};

	export type Result = Price.Model;
}

export class UpdatePriceStatusUseCase {
	constructor(
		private readonly isUserValidService: IsUserValidService,
		private readonly isOrganizationValidService: IsOrganizationValidService,
		private readonly isOrganizationMemberService: IsOrganizationMemberService,
		private readonly priceRepository: PriceRepository,
		private readonly productRepository: ProductRepository,
	) {}

	async execute(
		params: UpdatePriceStatus.Params,
	): Promise<UpdatePriceStatus.Result> {
		const priceModel = await this.priceRepository.findById(params.priceId);
		if (!priceModel) {
			throw new AppError("Price not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		const productModel = await this.productRepository.findById(
			priceModel.productId,
		);
		if (!productModel) {
			throw new AppError("Product not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}

		await this.validateUserAccess(params.userId, productModel.organizationId);

		const price = Price.Entity.fromModel(priceModel);
		price.updateStatus(params.status);

		await this.priceRepository.update(price.getSnapshot());

		return price.getSnapshot();
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
