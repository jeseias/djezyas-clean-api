import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { TokenManager } from "@/src/modules/shared/ports/outbound/token-manager";
import { Session } from "../../../domain/entities/session";
import { User } from "../../../domain/entities/user";
import type {
	SessionRepository,
	UserRepository,
} from "../../../ports/outbound";

export namespace RefreshToken {
	export type Params = {
		refreshToken: string;
		deviceInfo: {
			userAgent: string;
			ipAddress: string;
			deviceType?: "mobile" | "desktop" | "tablet";
			browser?: string;
			os?: string;
		};
	};

	export type Result = {
		user: User.Model;
		session: Session.Model;
		tokens: {
			accessToken: string;
			refreshToken: string;
			accessTokenExpiresIn: string;
			refreshTokenExpiresIn: string;
		};
		message: string;
	};
}

export class RefreshTokenUseCase {
	constructor(
		private readonly tokenManager: TokenManager,
		private readonly sessionRepository: SessionRepository,
		private readonly userRepository: Pick<UserRepository, "findById">,
	) {}

	async execute(params: RefreshToken.Params): Promise<RefreshToken.Result> {
		const { refreshToken } = params;

		let payload: Record<string, unknown>;
		try {
			payload = await this.tokenManager.verifyToken(refreshToken);
		} catch {
			throw new AppError(
				"Invalid or expired refresh token",
				401,
				ErrorCode.TOKEN_INVALID,
			);
		}

		// Check if it's a refresh token
		if (payload.type !== "refresh") {
			throw new AppError(
				"Invalid token type. Refresh token required.",
				401,
				ErrorCode.TOKEN_INVALID,
			);
		}

		const userId = payload.sub as string;
		if (!userId) {
			throw new AppError(
				"Invalid refresh token: missing user ID",
				401,
				ErrorCode.TOKEN_INVALID,
			);
		}

		const existingSession =
			await this.sessionRepository.findByRefreshToken(refreshToken);
		if (!existingSession) {
			throw new AppError(
				"Session not found for refresh token",
				401,
				ErrorCode.TOKEN_INVALID,
			);
		}

		if (!existingSession.isActive) {
			throw new AppError(
				"Session is no longer active",
				401,
				ErrorCode.TOKEN_INVALID,
			);
		}

		if (new Date() > existingSession.refreshTokenExpiresAt) {
			throw new AppError(
				"Refresh token has expired",
				401,
				ErrorCode.TOKEN_EXPIRED,
			);
		}

		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new AppError("User not found", 404, ErrorCode.USER_NOT_FOUND);
		}

		const userEntity = User.Entity.fromModel(user);

		if (!userEntity.isActive()) {
			throw new AppError(
				"User account is not active",
				403,
				ErrorCode.USER_NOT_ACTIVE,
			);
		}

		if (userEntity.isBlocked()) {
			throw new AppError(
				"User account is blocked",
				403,
				ErrorCode.USER_BLOCKED,
			);
		}

		const newAccessToken = await this.generateAccessToken(userEntity);
		const newRefreshToken = await this.generateRefreshToken(userEntity);

		const newAccessTokenExpiresAt = this.calculateAccessTokenExpiration();
		const newRefreshTokenExpiresAt = this.calculateRefreshTokenExpiration();

		const updatedSession = Session.Entity.fromModel({
			...existingSession,
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
			accessTokenExpiresAt: newAccessTokenExpiresAt,
			refreshTokenExpiresAt: newRefreshTokenExpiresAt,
			lastUsedAt: new Date(),
		});

		await this.sessionRepository.update(updatedSession.toJSON());

		return {
			user: userEntity.toJSON(),
			session: updatedSession.toJSON(),
			tokens: {
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
				accessTokenExpiresIn: "15m",
				refreshTokenExpiresIn: "7d",
			},
			message: "Token refreshed successfully",
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
