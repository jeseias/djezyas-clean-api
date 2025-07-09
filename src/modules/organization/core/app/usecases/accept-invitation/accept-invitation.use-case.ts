import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { OrganizationInvitation } from "../../../domain/entities/organization-invitation";
import type { OrganizationInvitationRepository } from "../../../ports/outbound/organization-invitation-repository";

export namespace AcceptInvitation {
	export type Params = {
		token: string;
	};
  export type Response = {
    message: string
  }
}

export class AcceptInvitationUseCase {
	constructor(
		private readonly organizationInvitationRepository: OrganizationInvitationRepository,
	) {}

	async execute(params: AcceptInvitation.Params): Promise<AcceptInvitation.Response> {
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

		return {
			message: "Invitation accepted",
		};
	}
}
