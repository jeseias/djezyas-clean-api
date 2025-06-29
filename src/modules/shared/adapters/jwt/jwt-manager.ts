import jwt from "jsonwebtoken";
import type { TokenManager } from "../../ports/outbound/token-manager";

export interface JwtConfig {
	secret: string;
	defaultExpiresIn?: string;
}

export class JwtManager implements TokenManager {
	private config: JwtConfig;

	constructor(config: JwtConfig) {
		this.config = {
			defaultExpiresIn: "1h",
			...config,
		};
	}

	async generateToken(
		payload: Record<string, unknown>,
		expiresIn?: string,
	): Promise<string> {
		const tokenExpiresIn = expiresIn || this.config.defaultExpiresIn;
		return jwt.sign(payload, this.config.secret, {
			expiresIn: tokenExpiresIn as jwt.SignOptions["expiresIn"],
		});
	}

	async verifyToken(token: string): Promise<Record<string, unknown>> {
		try {
			const decoded = jwt.verify(token, this.config.secret);

			if (typeof decoded === "string") {
				throw new Error("Invalid token format");
			}

			return decoded as Record<string, unknown>;
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				throw new Error("Token has expired");
			}
			if (error instanceof jwt.JsonWebTokenError) {
				throw new Error("Invalid token");
			}
			throw new Error("Token verification failed");
		}
	}
}
