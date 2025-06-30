import type { Organization } from "../../../core/domain/entities/organization";
import { organizationUseCasesFactory } from "../../factories/use-cases.factory";

interface GraphQLContext {
	userId?: string;
	userEmail?: string;
	userUsername?: string;
	userRole?: string;
}

export const organizationResolvers = {
	Query: {
		getOrganizationMembers: async (
			_: unknown,
			{ input }: { input: GetOrganizationMembersInput },
			{ userId }: GraphQLContext,
		) => {
			if (!userId) {
				throw new Error("Authentication required");
			}

			const getOrganizationMembersUseCase =
				organizationUseCasesFactory.getOrganizationMembers();
			const result = await getOrganizationMembersUseCase.execute({
				organizationId: input.organizationId,
			});

			return result;
		},
	},

	Mutation: {
		createOrganization: async (
			_: unknown,
			{ input }: { input: CreateOrganizationInput },
			{ userId }: GraphQLContext,
		) => {
			if (!userId) {
				throw new Error("Authentication required");
			}

			const createOrganizationUseCase =
				organizationUseCasesFactory.createOrganization();
			const organization = await createOrganizationUseCase.execute({
				name: input.name,
				slug: input.slug,
				ownerId: input.ownerId,
				plan: input.plan as Organization.PlanType | undefined,
				logoUrl: input.logoUrl,
				settings: input.settings,
				meta: input.meta,
			});

			return {
				organization,
			};
		},

		inviteMember: async (
			_: unknown,
			{ input }: { input: InviteMemberInput },
			{ userId }: GraphQLContext,
		) => {
			if (!userId) {
				throw new Error("Authentication required");
			}

			const inviteMemberUseCase = organizationUseCasesFactory.inviteMember();
			const result = await inviteMemberUseCase.execute({
				organizationId: input.organizationId,
				email: input.email,
				role: input.role,
			});

			return result;
		},
	},
};

// Type definitions for TypeScript
interface CreateOrganizationInput {
	name: string;
	slug: string;
	ownerId: string;
	plan?: "free" | "pro" | "enterprise";
	logoUrl?: string;
	settings?: Record<string, unknown>;
	meta?: Record<string, unknown>;
}

interface GetOrganizationMembersInput {
	organizationId: string;
}

interface InviteMemberInput {
	organizationId: string;
	email: string;
	role: "admin" | "member";
}
