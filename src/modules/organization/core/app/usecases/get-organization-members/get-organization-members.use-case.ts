import type { Id } from "@/src/modules/shared/value-objects";
import type { UserRepository } from "@/src/modules/user/core/ports/outbound/user-repository";
import type { OrganizationInvitation } from "../../../domain/entities/organization-invitation";
import type { OrganizationMember } from "../../../domain/entities/organization-member";
import type { OrganizationInvitationRepository } from "../../../ports/outbound/organization-invitation-repository";
import type { OrganizationMemberRepository } from "../../../ports/outbound/organization-member-repository";

export namespace GetOrganizationMembers {
	export type Params = {
		organizationId: Id;
	};

	export type MemberWithUser = OrganizationMember.Model & {
		user: {
			name: string;
			avatar: string | undefined;
			email: string;
		};
	};

	export type PendingInvitationWithUser = OrganizationInvitation.Model & {
		user: {
			name: string;
			avatar: string | undefined;
			email: string;
		};
	};

	export type Result = {
		members: MemberWithUser[];
		pendingInvitations: PendingInvitationWithUser[];
	};
}

export class GetOrganizationMembersUseCase {
	constructor(
		private readonly organizationMemberRepository: OrganizationMemberRepository,
		private readonly organizationInvitationRepository: OrganizationInvitationRepository,
		private readonly userRepository: UserRepository,
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

		const memberUserIds = members.map((member) => member.userId);
		const users = await Promise.all(
			memberUserIds.map((userId) => this.userRepository.findById(userId)),
		);

		const membersWithUser: GetOrganizationMembers.MemberWithUser[] = members
			.map((member, index) => {
				const user = users[index];
				if (!user) {
					return null;
				}

				return {
					...member,
					user: {
						name: user.name,
						avatar: user.avatar,
						email: user.email,
					},
				};
			})
			.filter(
				(member): member is NonNullable<typeof member> => member !== null,
			);

		const pendingInvitations: GetOrganizationMembers.PendingInvitationWithUser[] =
			allInvitations
				.filter((invitation) => invitation.status === "pending")
				.map((invitation) => ({
					...invitation,
					user: {
						name: invitation.email.split("@")[0],
						avatar: undefined,
						email: invitation.email,
					},
				}));

		return {
			members: membersWithUser,
			pendingInvitations,
		};
	}
}
