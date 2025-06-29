import type { PasswordHasher } from "../../ports/outbound/password-hasher";
import { createBcryptConfig } from "./bcrypt-config";
import { BcryptPasswordHasher } from "./bcrypt-password-hasher";

export const createPasswordHasher = (): PasswordHasher => {
	const config = createBcryptConfig();
	return new BcryptPasswordHasher(config);
};
