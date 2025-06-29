import type { Session } from "../../../core/domain/entities";
import type { SessionRepository } from "../../../core/ports/outbound";
import { type SessionDocument, SessionModel } from "./session-model";

export class MongooseSessionRepository implements SessionRepository {
	async create(sessionData: Session.Model): Promise<Session.Model> {
		const sessionDoc = new SessionModel({
			id: sessionData.id,
			userId: sessionData.userId,
			accessToken: sessionData.accessToken,
			refreshToken: sessionData.refreshToken,
			accessTokenExpiresAt: sessionData.accessTokenExpiresAt,
			refreshTokenExpiresAt: sessionData.refreshTokenExpiresAt,
			deviceInfo: sessionData.deviceInfo,
			isActive: sessionData.isActive,
			createdAt: sessionData.createdAt,
			updatedAt: sessionData.updatedAt,
			lastUsedAt: sessionData.lastUsedAt,
		});

		const savedSession = await sessionDoc.save();
		return this.mapToDomainModel(savedSession);
	}

	async update(data: Partial<Session.Model>): Promise<Session.Model> {
		if (!data.id) {
			throw new Error("Session id is required for update");
		}

		const updatedSession = await SessionModel.findOneAndUpdate(
			{ id: data.id },
			{ $set: data },
			{ new: true, runValidators: true },
		);

		if (!updatedSession) {
			throw new Error(`Session with id ${data.id} not found`);
		}

		return this.mapToDomainModel(updatedSession);
	}

	async delete(id: string): Promise<void> {
		const result = await SessionModel.deleteOne({ id });
		if (result.deletedCount === 0) {
			throw new Error(`Session with id ${id} not found`);
		}
	}

	async findById(id: string): Promise<Session.Model | null> {
		const session = await SessionModel.findOne({ id });
		return session && this.mapToDomainModel(session);
	}

	async findByUserId(userId: string): Promise<Session.Model[]> {
		const sessions = await SessionModel.find({ userId });
		return sessions.map((session) => this.mapToDomainModel(session));
	}

	async findByAccessToken(accessToken: string): Promise<Session.Model | null> {
		const session = await SessionModel.findOne({ accessToken });
		return session && this.mapToDomainModel(session);
	}

	async findByRefreshToken(
		refreshToken: string,
	): Promise<Session.Model | null> {
		const session = await SessionModel.findOne({ refreshToken });
		return session && this.mapToDomainModel(session);
	}

	private mapToDomainModel(sessionDoc: SessionDocument): Session.Model {
		return {
			id: sessionDoc.id,
			userId: sessionDoc.userId,
			accessToken: sessionDoc.accessToken,
			refreshToken: sessionDoc.refreshToken,
			accessTokenExpiresAt: sessionDoc.accessTokenExpiresAt,
			refreshTokenExpiresAt: sessionDoc.refreshTokenExpiresAt,
			deviceInfo: sessionDoc.deviceInfo,
			isActive: sessionDoc.isActive,
			createdAt: sessionDoc.createdAt,
			updatedAt: sessionDoc.updatedAt,
			lastUsedAt: sessionDoc.lastUsedAt,
		};
	}
}
