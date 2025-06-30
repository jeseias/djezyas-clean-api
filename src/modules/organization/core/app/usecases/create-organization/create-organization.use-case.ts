import { AppError } from "@/src/modules/shared/errors";
import { User } from "@/src/modules/user/core/domain/entities";
import type { UserRepository } from "@/src/modules/user/core/ports/outbound/user-repository";
import { Organization } from "../../../domain/entities";
import { OrganizationMember } from "../../../domain/entities/organization-member";
import type { OrganizationMemberRepository } from "../../../ports/outbound/organization-member-repository";
import type { OrganizationRepository } from "../../../ports/outbound/organization-repository";

export namespace CreateOrganization {
	export type Params = {
		name: string;
		slug: string;
		ownerId: string;
		plan?: Organization.PlanType;
		logoUrl?: string;
		settings?: Organization.Settings;
		meta?: Record<string, unknown>;
	};

	export type Result = Organization.Model;
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
		const ownerModel = await this.userRepository.findById(params.ownerId);
		if (!ownerModel) {
			throw new AppError("Owner must exist", 400);
		}
		const owner = User.Entity.fromModel(ownerModel);

		if (!owner.isEmailVerified()) {
			throw new AppError("Owner must have a verified account", 400);
		}
		if (!owner.isActive()) {
			throw new AppError("Owner account must be active", 400);
		}
		if (owner.isBlocked()) {
			throw new AppError("Owner account is blocked", 400);
		}

		const org = Organization.Entity.create({
			name: params.name,
			ownerId: params.ownerId,
			plan: params.plan,
			logoUrl: params.logoUrl,
			settings: params.settings,
			meta: params.meta,
			members: [],
		});

		await this.organizationRepository.create(org.toJSON());

		const ownerMember = OrganizationMember.Entity.create({
			organizationId: org.id,
			userId: params.ownerId,
			role: "owner",
			invitedAt: new Date(),
			joinedAt: new Date(),
		});
		await this.organizationMemberRepository.create(ownerMember.toJSON());

		org.addMember(ownerMember.toJSON());

		return org.toJSON();
	}
}
