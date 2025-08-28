import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { Organization } from "../../../domain/entities";
import type { OrganizationRepository } from "../../../ports/outbound/organization-repository";
import type { IsOrganizationMemberService } from "../../services";

export namespace UpdateOrganization {
	export type Params = {
		organizationId: string;
		name?: string;
		description?: string;
		location?: Organization.Location;
		updatedById: string;
	};

	export type Result = Organization.Props;
}

export class UpdateOrganizationUseCase {
	constructor(
		private readonly organizationRepository: OrganizationRepository,
		private readonly isMemberOfOrganizationService: IsOrganizationMemberService,
	) {}

	async execute(
		params: UpdateOrganization.Params,
	): Promise<UpdateOrganization.Result> {
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

			// Update name if provided
			if (params.name) {
				organization.updateName(params.name);
			}

			// Update location if provided
			if (params.location) {
				organization.updateLocation(params.location);
			}

			// Update description (stored in meta)
			if (params.description !== undefined) {
				const currentMeta = organization.meta || {};
				organization.updateMeta({
					...currentMeta,
					description: params.description,
				});
			}

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
				"Failed to update organization",
				500,
				ErrorCode.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
