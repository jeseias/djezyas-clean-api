import { withUser } from "@/src/main/elysia/plugins";
import type { AcceptInvitation } from "../../../core/app/usecases/accept-invitation/accept-invitation.use-case";
import { organizationUseCasesFactory } from "../../factories/use-cases.factory";

export const organizationResolvers = {
	Query: {
		getOrganizationMembers: withUser(async (
			{ input }: { input: GetOrganizationMembersInput },
		) => {			
			const getOrganizationMembersUseCase =
				organizationUseCasesFactory.getOrganizationMembers();
			const result = await getOrganizationMembersUseCase.execute({
				organizationId: input.organizationId,
			});

			return result;
		}),

		loadMyOrganizations: withUser(async (_args,{ userId }) => {
			const loadMyOrganizationsUseCase =
				organizationUseCasesFactory.loadMyOrganizations();
        
			const result = await loadMyOrganizationsUseCase.execute({
				userId,
			});

			return result;
		}),
	},

	Mutation: {
		createOrganization: withUser(async (
			{ input }: { input: CreateOrganizationInput },
			{ userId },
		) => {

			const createOrganizationUseCase =
				organizationUseCasesFactory.createOrganization();
			const organization = await createOrganizationUseCase.execute({
				name: input.name,
				ownerId: userId,
			});

			return {
				organization,
			};
		}),

		inviteMember: withUser(async (
			{ input }: { input: InviteMemberInput },
		) => {			
			const inviteMemberUseCase = organizationUseCasesFactory.inviteMember();
			const result = await inviteMemberUseCase.execute({
				organizationId: input.organizationId,
				email: input.email,
				role: input.role,
			});

			return result;
		}),

    acceptInvitation: withUser(async (
      { input }: { input: AcceptInvitation.Params },
    ) => {      
      const acceptInvitationUseCase = organizationUseCasesFactory.acceptInvitation();
      const result = await acceptInvitationUseCase.execute(input);

      return result;
    })
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
