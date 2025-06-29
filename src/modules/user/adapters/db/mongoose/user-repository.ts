import type { User } from "../../../core/domain/entities";
import type { UserRepository } from "../../../core/ports/outbound";
import { type UserDocument, UserModel } from "./user-model";

export class MongooseUserRepository implements UserRepository {
	async create(userData: User.Model): Promise<User.Model> {
		const userDoc = new UserModel({
			id: userData.id,
			name: userData.name,
			email: userData.email,
			username: userData.username,
			phone: userData.phone,
			password: userData.password,
			bio: userData.bio,
			avatar: userData.avatar,
			status: userData.status,
			role: userData.role,
			verificationCode: userData.verificationCode,
			verificationCodeExpiresAt: userData.verificationCodeExpiresAt,
			emailVerifiedAt: userData.emailVerifiedAt,
			passwordResetToken: userData.passwordResetToken,
			passwordResetTokenExpiresAt: userData.passwordResetTokenExpiresAt,
			createdAt: userData.createdAt,
			updatedAt: userData.updatedAt,
		});

		const savedUser = await userDoc.save();
		return this.mapToDomainModel(savedUser);
	}

	async update(data: Partial<User.Model>): Promise<User.Model> {
		if (!data.id) {
			throw new Error("User id is required for update");
		}

		const updatedUser = await UserModel.findOneAndUpdate(
			{ id: data.id },
			{ $set: data },
			{ new: true, runValidators: true },
		);

		if (!updatedUser) {
			throw new Error(`User with id ${data.id} not found`);
		}

		return this.mapToDomainModel(updatedUser);
	}

	async findById(id: string): Promise<User.Model | null> {
		const user = await UserModel.findOne({ id });
		return user && this.mapToDomainModel(user);
	}

	async findByEmail(email: string): Promise<User.Model | null> {
		const user = await UserModel.findOne({ email: email.toLowerCase() });
		return user && this.mapToDomainModel(user);
	}

	async findByUsername(username: string): Promise<User.Model | null> {
		const user = await UserModel.findOne({ username });
		return user && this.mapToDomainModel(user);
	}

	async findByPhone(phone: string): Promise<User.Model | null> {
		const user = await UserModel.findOne({ phone });
		return user && this.mapToDomainModel(user);
	}

	async findByPasswordResetToken(token: string): Promise<User.Model | null> {
		const user = await UserModel.findOne({ passwordResetToken: token }).select(
			"+passwordResetToken +passwordResetTokenExpiresAt",
		);
		return user && this.mapToDomainModel(user);
	}

	private mapToDomainModel(userDoc: UserDocument): User.Model {
		return {
			id: userDoc.id,
			name: userDoc.name,
			email: userDoc.email,
			username: userDoc.username,
			phone: userDoc.phone,
			password: userDoc.password,
			bio: userDoc.bio,
			avatar: userDoc.avatar,
			status: userDoc.status,
			role: userDoc.role,
			verificationCode: userDoc.verificationCode,
			verificationCodeExpiresAt: userDoc.verificationCodeExpiresAt,
			emailVerifiedAt: userDoc.emailVerifiedAt,
			passwordResetToken: userDoc.passwordResetToken,
			passwordResetTokenExpiresAt: userDoc.passwordResetTokenExpiresAt,
			createdAt: userDoc.createdAt,
			updatedAt: userDoc.updatedAt,
		};
	}
}
