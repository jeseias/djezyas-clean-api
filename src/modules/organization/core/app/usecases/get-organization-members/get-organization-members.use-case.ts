import type { OrganizationInvitation } from "../../../domain/entities/organization-invitation";
import type { OrganizationMember } from "../../../domain/entities/organization-member";
import type { OrganizationInvitationRepository } from "../../../ports/outbound/organization-invitation-repository";
import type { OrganizationMemberRepository } from "../../../ports/outbound/organization-member-repository";

export namespace GetOrganizationMembers {
	export type Params = {
		organizationId: string;
	};

	export type Result = {
		members: OrganizationMember.Model[];
		pendingInvitations: OrganizationInvitation.Model[];
	};
}

export class GetOrganizationMembersUseCase {
	constructor(
		private readonly organizationMemberRepository: OrganizationMemberRepository,
		private readonly organizationInvitationRepository: OrganizationInvitationRepository,
	) {}

	async execute(
		params: GetOrganizationMembers.Params,
	): Promise<GetOrganizationMembers.Result> {
		const [members, allInvitations] = await Promise.all([
			this.organizationMemberRepository.findByOrganizationId(
				params.organizationId,
			),
			this.organizationInvitationRepository.findByOrganizationId(
				params.organizationId,
			),
		]);

		// Filter for pending invitations (where acceptedAt is null)
		const pendingInvitations = allInvitations.filter(
			(invitation) => invitation.acceptedAt === null,
		);

		return {
			members,
			pendingInvitations,
		};
	}
}
