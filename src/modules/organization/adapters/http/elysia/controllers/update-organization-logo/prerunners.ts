import type { z } from "zod";
import type { ControllerRequest } from "@/src/modules/shared/adapters/http/elysia/controller";
import type {
	PreRunner,
	PreRunnerOrKey,
} from "@/src/modules/shared/adapters/http/elysia/pre-runners";
import type { StorageAdapter } from "@/src/modules/shared/ports/storage-adapter";
import { transformBracketNotationPreRunner } from "@/src/modules/shared/prerunners/transform-bracket-notation";
import { uploadImageUrlPreRunner } from "@/src/modules/shared/prerunners/upload-image-url";
import {
	type UpdateOrganizationLogoBody,
	updateOrganizationLogoSchema,
} from "./schemas";

export function createZodPreRunner<Body>(
	schema: z.ZodType<Body>,
): PreRunner<Body, unknown, unknown, unknown> {
	return async (req: ControllerRequest<Body, unknown, unknown, unknown>) => {
		const result = schema.safeParse(req.body);
		if (!result.success) {
			throw {
				statusCode: 400,
				message: "Validation failed",
				errors: result.error.flatten(),
			};
		}
		req.body = result.data;
	};
}

export function createUpdateOrganizationLogoPreRunners(
	storage: StorageAdapter,
): PreRunnerOrKey<UpdateOrganizationLogoBody, unknown, unknown, unknown>[] {
	return [
		"auth",
		uploadImageUrlPreRunner<UpdateOrganizationLogoBody>(storage, "logoUrl"),
		transformBracketNotationPreRunner<UpdateOrganizationLogoBody>(),
		createZodPreRunner(updateOrganizationLogoSchema),
	];
}
