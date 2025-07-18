import type { OrganizationInvitation } from "../../../domain/entities/organization-invitation";
import type { OrganizationInvitationRepository } from "../../../ports/outbound/organization-invitation-repository";

export namespace LoadMyInvitations {
	export type Params = {
		email: string;
	};

	export type Result = {
		invitations: OrganizationInvitation.ModelWithOrganization[];
	};
}

export class LoadMyInvitationsUseCase {
	constructor(
		private readonly organizationInvitationRepository: OrganizationInvitationRepository,
	) {}

	async execute(
		params: LoadMyInvitations.Params,
	): Promise<LoadMyInvitations.Result> {
		const invitations = await this.organizationInvitationRepository.findByEmail(
			params.email,
		);

		return {
			invitations,
		};
	}
}
