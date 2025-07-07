import type { Id } from "@/src/modules/shared/value-objects";
import type { OrganizationMemberRepository } from "../../../ports/outbound/organization-member-repository";
import type { OrganizationRepository } from "../../../ports/outbound/organization-repository";

export namespace LoadMyOrganizations {
	export type Params = {
		userId: Id;
	};

	export type OrganizationSummary = {
		id: Id;
		name: string;
		slug: string;
		logoUrl?: string;
	};

	export type Result = {
		organizations: OrganizationSummary[];
	};
}

export class LoadMyOrganizationsUseCase {
	constructor(
		private readonly organizationMemberRepository: OrganizationMemberRepository,
		private readonly organizationRepository: OrganizationRepository,
	) {}

	async execute(
		params: LoadMyOrganizations.Params,
	): Promise<LoadMyOrganizations.Result> {
		const memberships = await this.organizationMemberRepository.findByUserId(
			params.userId,
		);

		const organizations = await Promise.all(
			memberships.map(async (membership) => {
				const organization = await this.organizationRepository.findById(
					membership.organizationId,
				);

				if (!organization) {
					return null;
				}

				return {
					id: organization.id,
					name: organization.name,
					slug: organization.slug.toString(),
					logoUrl: organization.logoUrl,
				};
			}),
		);

		const validOrganizations = organizations.filter(
			(org): org is NonNullable<typeof org> => org !== null,
		);

		return {
			organizations: validOrganizations,
		};
	}
} 