import type { UpdateOrganizationLogoUseCase } from "@/src/modules/organization/core/app/usecases/update-organization-logo/update-organization-logo.use-case";
import type { Organization } from "@/src/modules/organization/core/domain/entities";
import {
	Controller,
	type ControllerRequest,
	type ControllerResponse,
} from "@/src/modules/shared/adapters/http/elysia/controller";
import type { StorageAdapter } from "@/src/modules/shared/ports/storage-adapter";
import { createUpdateOrganizationLogoPreRunners } from "./prerunners";
import type { UpdateOrganizationLogoBody } from "./schemas";

export class UpdateOrganizationLogoController extends Controller<
	UpdateOrganizationLogoBody,
	unknown,
	unknown,
	unknown,
	Organization.Props
> {
	constructor(
		private readonly updateOrganizationLogoUseCase: UpdateOrganizationLogoUseCase,
		private readonly storage: StorageAdapter,
	) {
		super(createUpdateOrganizationLogoPreRunners(storage));
	}

	async execute(
		request: ControllerRequest<UpdateOrganizationLogoBody>,
	): Promise<ControllerResponse<Organization.Props>> {
		const organizationProps = await this.updateOrganizationLogoUseCase.execute({
			logoUrl: request.body.logoUrl as string,
			organizationId: request.body.organizationId,
			updatedById: request.user!.id,
		});

		return {
			statusCode: 200,
			data: organizationProps,
		};
	}
}
