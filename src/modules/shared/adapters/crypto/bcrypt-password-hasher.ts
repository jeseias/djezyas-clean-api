import bcrypt from "bcrypt";
import type { PasswordHasher } from "../../ports/outbound/password-hasher";

export interface BcryptConfig {
	saltRounds?: number;
}

export class BcryptPasswordHasher implements PasswordHasher {
	private config: BcryptConfig;

	constructor(config: BcryptConfig = {}) {
		this.config = {
			saltRounds: 12,
			...config,
		};
	}

	async hash(password: string): Promise<string> {
		return bcrypt.hash(password, this.config.saltRounds!);
	}

	async compare(password: string, hash: string): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}
}
