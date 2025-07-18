import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { OrganizationInvitation } from "../../../domain/entities/organization-invitation";
import { OrganizationMember } from "../../../domain/entities/organization-member";
import type { OrganizationInvitationRepository } from "../../../ports/outbound/organization-invitation-repository";
import type { OrganizationMemberRepository } from "../../../ports/outbound/organization-member-repository";

export namespace AcceptInvitation {
	export type Params = {
		token: string;
		userId: string;
	};
	export type Response = {
		message: string;
	};
}

export class AcceptInvitationUseCase {
	constructor(
		private readonly organizationInvitationRepository: OrganizationInvitationRepository,
		private readonly organizationMemberRepository: OrganizationMemberRepository,
	) {}

	async execute(
		params: AcceptInvitation.Params,
	): Promise<AcceptInvitation.Response> {
		const invitation = await this.organizationInvitationRepository.findByToken(
			params.token,
		);

		if (!invitation) {
			throw new AppError(
				"Invitation not found",
				404,
				ErrorCode.INVITATION_NOT_FOUND,
			);
		}

		if (invitation.status === "accepted") {
			throw new AppError(
				"Invitation already accepted",
				400,
				ErrorCode.INVITATION_ALREADY_ACCEPTED,
			);
		}

		if (invitation.status === "expired") {
			throw new AppError(
				"Invitation expired",
				400,
				ErrorCode.INVITATION_EXPIRED,
			);
		}

		const invitationEntity =
			OrganizationInvitation.Entity.fromModel(invitation);

		invitationEntity.accept();

		await this.organizationInvitationRepository.update(
			invitationEntity.toJSON(),
		);

		const member = OrganizationMember.Entity.create({
			organizationId: invitationEntity.organizationId,
			userId: params.userId,
			role: invitationEntity.role,
			invitedAt: invitationEntity.invitedAt,
			joinedAt: invitationEntity.acceptedAt,
		});

		await this.organizationMemberRepository.create({
			...member.toJSON(),
		});
		await this.organizationMemberRepository.create(member.toJSON());

		return {
			message: "Invitation accepted",
		};
	}
}
