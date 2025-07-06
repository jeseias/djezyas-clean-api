import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { TokenManager } from "@/src/modules/shared/ports/outbound/token-manager";
import { Session } from "../../domain/entities/session";
import type { User } from "../../domain/entities/user";
import type { SessionRepository } from "../../ports/outbound/session-repository";

export namespace AuthenticateUser {
	export type Params = {
		user: User.Entity;
		deviceInfo: {
			userAgent: string;
			ipAddress: string;
			deviceType?: "mobile" | "desktop" | "tablet";
			browser?: string;
			os?: string;
		};
	};

	export type Result = {
		user: User.Entity;
		session: Session.Entity;
		tokens: {
			accessToken: string;
			refreshToken: string;
			accessTokenExpiresIn: string;
			refreshTokenExpiresIn: string;
		};
	};
}

export class AuthenticateUser {
	constructor(
		private readonly tokenManager: TokenManager,
		private readonly sessionRepo: SessionRepository,
	) {}

	async execute(
		params: AuthenticateUser.Params,
	): Promise<AuthenticateUser.Result> {
		const { user, deviceInfo } = params;

		if (!user.isActive()) {
			throw new AppError("User account is not active", 403, ErrorCode.USER_NOT_ACTIVE);
		}

		if (user.isBlocked()) {
			throw new AppError("User account is blocked", 403, ErrorCode.USER_BLOCKED);
		}

		const accessToken = await this.generateAccessToken(user);
		const refreshToken = await this.generateRefreshToken(user);

		const accessTokenExpiresAt = this.calculateAccessTokenExpiration();
		const refreshTokenExpiresAt = this.calculateRefreshTokenExpiration();

		const session = Session.Entity.create({
			userId: user.id,
			accessToken,
			refreshToken,
			accessTokenExpiresAt,
			refreshTokenExpiresAt,
			deviceInfo,
		});

		await this.sessionRepo.create(session.toJSON());

		return {
			user,
			session,
			tokens: {
				accessToken,
				refreshToken,
				accessTokenExpiresIn: "15m",
				refreshTokenExpiresIn: "7d",
			},
		};
	}

	private async generateAccessToken(user: User.Entity): Promise<string> {
		const payload = {
			sub: user.id,
			email: user.email,
			username: user.username,
			role: user.role,
			type: "access",
		};

		return this.tokenManager.generateToken(payload, "15m");
	}

	private async generateRefreshToken(user: User.Entity): Promise<string> {
		const payload = {
			sub: user.id,
			type: "refresh",
		};

		return this.tokenManager.generateToken(payload, "7d");
	}

	private calculateAccessTokenExpiration(): Date {
		const expiration = new Date();
		expiration.setMinutes(expiration.getMinutes() + 15);
		return expiration;
	}

	private calculateRefreshTokenExpiration(): Date {
		const expiration = new Date();
		expiration.setDate(expiration.getDate() + 7);
		return expiration;
	}
}
