import type { Id } from "@/src/modules/shared/value-objects";

export namespace Session {
	export type Model = {
		id: Id;
		userId: Id;
		accessToken: string;
		refreshToken: string;
		accessTokenExpiresAt: Date;
		refreshTokenExpiresAt: Date;
		deviceInfo: {
			userAgent: string;
			ipAddress: string;
			deviceType?: "mobile" | "desktop" | "tablet";
			browser?: string;
			os?: string;
		};
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
		lastUsedAt: Date;
	};

	export type CreateParams = {
		userId: string;
		accessToken: string;
		refreshToken: string;
		accessTokenExpiresAt: Date;
		refreshTokenExpiresAt: Date;
		deviceInfo: {
			userAgent: string;
			ipAddress: string;
			deviceType?: "mobile" | "desktop" | "tablet";
			browser?: string;
			os?: string;
		};
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			const now = new Date();

			const session: Model = {
				id: crypto.randomUUID(),
				userId: params.userId,
				accessToken: params.accessToken,
				refreshToken: params.refreshToken,
				accessTokenExpiresAt: params.accessTokenExpiresAt,
				refreshTokenExpiresAt: params.refreshTokenExpiresAt,
				deviceInfo: params.deviceInfo,
				isActive: true,
				createdAt: now,
				updatedAt: now,
				lastUsedAt: now,
			};

			return new Entity(session);
		}

		static fromModel(model: Model): Entity {
			return new Entity(model);
		}

		get id(): string {
			return this.props.id;
		}

		get userId(): string {
			return this.props.userId;
		}

		get accessToken(): string {
			return this.props.accessToken;
		}

		get refreshToken(): string {
			return this.props.refreshToken;
		}

		get accessTokenExpiresAt(): Date {
			return this.props.accessTokenExpiresAt;
		}

		get refreshTokenExpiresAt(): Date {
			return this.props.refreshTokenExpiresAt;
		}

		get deviceInfo() {
			return this.props.deviceInfo;
		}

		get isActive(): boolean {
			return this.props.isActive;
		}

		get createdAt(): Date {
			return this.props.createdAt;
		}

		get lastUsedAt(): Date {
			return this.props.lastUsedAt;
		}

		isAccessTokenExpired(): boolean {
			return new Date() > this.props.accessTokenExpiresAt;
		}

		isRefreshTokenExpired(): boolean {
			return new Date() > this.props.refreshTokenExpiresAt;
		}

		isExpired(): boolean {
			return this.isAccessTokenExpired() && this.isRefreshTokenExpired();
		}

		deactivate(): void {
			this.props.isActive = false;
			this.props.updatedAt = new Date();
		}

		updateLastUsed(): void {
			this.props.lastUsedAt = new Date();
			this.props.updatedAt = new Date();
		}

		toJSON(): Model {
			return { ...this.props };
		}
	}
}
