import { _env } from "@/src/main/config/_env";

export interface BcryptConfig {
	saltRounds?: number;
}

export const createBcryptConfig = (): BcryptConfig => {
	return {
		saltRounds: _env.BCRYPT_SALT_ROUNDS || 12,
	};
};
