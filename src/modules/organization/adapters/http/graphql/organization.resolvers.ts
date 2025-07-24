import { withUser } from "@/src/main/elysia/plugins";
import { debugResolver, makeResolver } from "@/src/main/graphql/graphql-utils";
import { organizationUseCasesFactory } from "../../factories/use-cases.factory";

export const organizationResolvers = {
	Query: {
		getOrganizationMembers: withUser(
			async ({ input }: { input: GetOrganizationMembersInput }) => {
				const getOrganizationMembersUseCase =
					organizationUseCasesFactory.getOrganizationMembers();
				const result = await getOrganizationMembersUseCase.execute({
					organizationId: input.organizationId,
				});

				return result;
			},
		),

		loadMyOrganizations: withUser(async (_, { userId }) => {
			const loadMyOrganizationsUseCase =
				organizationUseCasesFactory.loadMyOrganizations();

			const result = await loadMyOrganizationsUseCase.execute({
				userId,
			});

			return result;
		}),

		loadMyInvitations: makeResolver(async (_, { userEmail }) => {
			const loadMyInvitationsUseCase =
				organizationUseCasesFactory.loadMyInvitations();

			const result = await loadMyInvitationsUseCase.execute({
				email: userEmail,
			});

			return result;
		}),

		listStores: makeResolver(
			async (_, { input }: { input: ListStoresInput }) => {
				console.log("🔍 [DEBUG] listStores resolver - input:", input);

				const loadStoresUseCase = organizationUseCasesFactory.loadStores();
				console.log("🔍 [DEBUG] listStores resolver - use case created");

				const result = await loadStoresUseCase.execute({
					page: input.page || 1,
					limit: input.limit || 10,
					search: input.search,
				});

				console.log("🔍 [DEBUG] listStores resolver - result:", result);

				return result;
			},
			{ requireAuth: false },
		),
	},

	Mutation: {
		createOrganization: withUser(
			async ({ input }: { input: CreateOrganizationInput }, { userId }) => {
				const createOrganizationUseCase =
					organizationUseCasesFactory.createOrganization();
				const organization = await createOrganizationUseCase.execute({
					name: input.name,
					ownerId: userId,
				});

				return {
					organization,
				};
			},
		),

		inviteMember: withUser(async ({ input }: { input: InviteMemberInput }) => {
			const inviteMemberUseCase = organizationUseCasesFactory.inviteMember();
			const result = await inviteMemberUseCase.execute({
				organizationId: input.organizationId,
				email: input.email,
				role: input.role,
			});

			return result;
		}),

		acceptInvitation: makeResolver(async ({ input }, { userId }) => {
			const acceptInvitationUseCase =
				organizationUseCasesFactory.acceptInvitation();
			const result = await acceptInvitationUseCase.execute({
				...input,
				userId,
			});

			return result;
		}),
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

interface ListStoresInput {
	page?: number;
	limit?: number;
	search?: string;
}
