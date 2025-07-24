import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { User } from "@/src/modules/user/core/domain/entities";
import type { UserRepository } from "@/src/modules/user/core/ports/outbound/user-repository";
import { Organization } from "../../../domain/entities";
import { OrganizationMember } from "../../../domain/entities/organization-member";
import type { OrganizationMemberRepository } from "../../../ports/outbound/organization-member-repository";
import type { OrganizationRepository } from "../../../ports/outbound/organization-repository";

export namespace CreateOrganization {
	export type Params = {
		name: string;
		ownerId: string;
		logoUrl?: string;
		settings?: Organization.Settings;
		meta?: Record<string, unknown>;
	};

	export type Result = Organization.Props;
}

export class CreateOrganizationUseCase {
	constructor(
		private readonly organizationRepository: OrganizationRepository,
		private readonly organizationMemberRepository: OrganizationMemberRepository,
		private readonly userRepository: UserRepository,
	) {}

	async execute(
		params: CreateOrganization.Params,
	): Promise<CreateOrganization.Result> {
		try {
			const ownerModel = await this.userRepository.findById(params.ownerId);
			if (!ownerModel) {
				throw new AppError("Owner must exist", 400, ErrorCode.USER_NOT_FOUND);
			}
			const owner = User.Entity.fromModel(ownerModel);

			if (!owner.isEmailVerified()) {
				throw new AppError(
					"Owner must have a verified account",
					400,
					ErrorCode.EMAIL_NOT_VERIFIED,
				);
			}
			if (!owner.isActive()) {
				throw new AppError(
					"Owner account must be active",
					400,
					ErrorCode.USER_NOT_ACTIVE,
				);
			}
			if (owner.isBlocked()) {
				throw new AppError(
					"Owner account is blocked",
					400,
					ErrorCode.USER_BLOCKED,
				);
			}

			const org = Organization.Entity.create({
				name: params.name,
				ownerId: params.ownerId,
				plan: Organization.PlanType.FREE,
				meta: params.meta,
				members: [],
			});

			await this.organizationRepository.create(
				org.getSnapshot() as Organization.Props,
			);

			const ownerMember = OrganizationMember.Entity.create({
				organizationId: org.id,
				userId: params.ownerId,
				role: "owner",
				invitedAt: new Date(),
				joinedAt: new Date(),
			});
			await this.organizationMemberRepository.create(ownerMember.toJSON());

			org.addMember(ownerMember.toJSON());

			return org.getSnapshot() as Organization.Props;
		} catch (error) {
			console.error(error);
			throw new AppError(
				"Failed to create organization",
				500,
				ErrorCode.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
