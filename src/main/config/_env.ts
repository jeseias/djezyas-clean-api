import { z } from "zod";

export const envSchema = z.object({
	PORT: z.coerce.number().default(3333),
	MONGODB_URI: z.string().default("mongodb://localhost:27017/kianda"),
	POSTMARK_API_KEY: z.string(),
	POSTMARK_FROM_EMAIL: z.string().email(),
	POSTMARK_REPLY_TO_EMAIL: z.string().email(),
	BCRYPT_SALT_ROUNDS: z.coerce.number(),
	JWT_SECRET: z.string(),
	JWT_DEFAULT_EXPIRES_IN: z.string(),
	SWAGGER_DOCS_USERNAME: z.string(),
	SWAGGER_DOCS_PASSWORD: z.string(),
	SERVER_URL: z.string().url(),

	// ImageKit
	IMAGE_KIT_PUBLIC_KEY: z.string(),
	IMAGE_KIT_PRIVATE_KEY: z.string(),
	IMAGE_KIT_URL_ENDPOINT: z.string(),

	// EMIS
	MCX_EXPRESS_REQUEST_TOKEN_URL: z.string(),
	MCX_EXPRESS_FRAME_TOKEN: z.string(),
	MCX_EXPRESS_CALLBACK_URL: z.string(),
});

const _envSchema = envSchema.safeParse(process.env);

if (_envSchema.success === false) {
	console.error("Invalid environment variables", _envSchema.error.format());
	throw new Error("Invalid environment variables");
}

export const _env = _envSchema.data;
