import type { TokenManager } from "../../ports/outbound/token-manager";
import { createJwtConfig } from "./jwt-config";
import { JwtManager } from "./jwt-manager";

export const createJwtManager = (): TokenManager => {
	const config = createJwtConfig();
	return new JwtManager(config);
};
