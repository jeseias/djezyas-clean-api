import { z } from "zod";
import type { ControllerRequest, PreRunner } from "@/src/modules/shared/adapters/http/elysia/controller";
import type { StorageAdapter } from "@/src/modules/shared/ports/storage-adapter";
import { uploadImageUrlPreRunner } from "@/src/modules/shared/prerunners/upload-image-url";
import { saveProductSchema, type SaveProductBody } from "./schemas";

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

export function createSaveProductPreRunners(storage: StorageAdapter): PreRunner<SaveProductBody, unknown, unknown, unknown>[] {
	return [
		uploadImageUrlPreRunner<SaveProductBody>(storage, "imageUrl"),
		createZodPreRunner(saveProductSchema),
		"auth",
	];
} 