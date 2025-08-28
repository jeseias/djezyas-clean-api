import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { Organization } from "../../../domain/entities";
import type { OrganizationRepository } from "../../../ports/outbound/organization-repository";
import type { IsOrganizationMemberService } from "../../services";

export namespace UpdateOrganizationLogo {
	export type Params = {
		organizationId: string;
		logoUrl: string;
		updatedById: string;
	};

	export type Result = Organization.Props;
}

export class UpdateOrganizationLogoUseCase {
	constructor(
		private readonly organizationRepository: OrganizationRepository,
		private readonly isMemberOfOrganizationService: IsOrganizationMemberService,
	) {}

	async execute(
		params: UpdateOrganizationLogo.Params,
	): Promise<UpdateOrganizationLogo.Result> {
		try {
			const orgModel = await this.organizationRepository.findById(
				params.organizationId,
			);
			if (!orgModel) {
				throw new AppError(
					"Organization not found",
					404,
					ErrorCode.ENTITY_NOT_FOUND,
				);
			}

			await this.isMemberOfOrganizationService.execute(
				params.organizationId,
				params.updatedById,
			);

			const organization = Organization.Entity.fromModel(orgModel);

			if (organization.status !== Organization.Status.ACTIVE) {
				throw new AppError(
					"Organization must be active",
					400,
					ErrorCode.ORGANIZATION_NOT_ACTIVE,
				);
			}

			organization.updateLogoUrl(params.logoUrl);

			await this.organizationRepository.update(
				organization.getSnapshot() as Organization.Props,
			);

			return organization.getSnapshot() as Organization.Props;
		} catch (error) {
			console.error(error);
			if (error instanceof AppError) {
				throw error;
			}
			throw new AppError(
				"Failed to update organization logo",
				500,
				ErrorCode.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
