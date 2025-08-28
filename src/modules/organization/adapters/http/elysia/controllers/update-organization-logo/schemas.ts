import { z } from "zod";

export const updateOrganizationLogoSchema = z
	.object({
		organizationId: z.string().min(1, "Organization ID is required").uuid(),
		logoUrl: z.string().url("Logo URL must be a valid URL").optional(),
	})
	.strict();

export type UpdateOrganizationLogoBody = z.infer<
	typeof updateOrganizationLogoSchema
>;
