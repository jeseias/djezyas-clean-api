import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { Session } from "../domain/entities";

export type SessionRepository = Pick<
	Repository<Session.Model>,
	"create" | "update" | "delete"
> & {
	findById(id: string): Promise<Session.Model | null>;
	findByUserId(userId: string): Promise<Session.Model[]>;
	findByAccessToken(accessToken: string): Promise<Session.Model | null>;
	findByRefreshToken(refreshToken: string): Promise<Session.Model | null>;
	// findActiveSessionsByUserId(userId: string): Promise<Session.Model[]>;
	// deactivateAllSessionsByUserId(userId: string): Promise<void>;
	// deactivateSessionById(id: string): Promise<void>;
	// deleteExpiredSessions(): Promise<void>;
};
