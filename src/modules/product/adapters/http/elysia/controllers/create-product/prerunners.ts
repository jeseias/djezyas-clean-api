import type { z } from "zod";
import type { ControllerRequest } from "@/src/modules/shared/adapters/http/elysia/controller";
import type {
	PreRunner,
	PreRunnerOrKey,
} from "@/src/modules/shared/adapters/http/elysia/pre-runners";
import type { StorageAdapter } from "@/src/modules/shared/ports/storage-adapter";
import { transformBracketNotationPreRunner } from "@/src/modules/shared/prerunners/transform-bracket-notation";
import { uploadImageUrlPreRunner } from "@/src/modules/shared/prerunners/upload-image-url";
import { type SaveProductBody, saveProductSchema } from "./schemas";

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

export function createSaveProductPreRunners(
	storage: StorageAdapter,
): PreRunnerOrKey<SaveProductBody, unknown, unknown, unknown>[] {
	return [
		"auth",
		uploadImageUrlPreRunner<SaveProductBody>(storage, "imageUrl"),
		transformBracketNotationPreRunner<SaveProductBody>(),
		createZodPreRunner(saveProductSchema),
	];
}
