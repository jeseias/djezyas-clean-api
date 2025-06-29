import { _env } from "@/src/main/config/_env";

export interface JwtConfig {
	secret: string;
	defaultExpiresIn?: string;
}

export const createJwtConfig = (): JwtConfig => {
	const secret = _env.JWT_SECRET;

	if (!secret) {
		throw new Error("JWT_SECRET environment variable is required");
	}

	return {
		secret,
		defaultExpiresIn: _env.JWT_DEFAULT_EXPIRES_IN || "1h",
	};
};
