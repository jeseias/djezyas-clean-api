import type { Url } from "@/src/modules/shared/value-objects";
import { type Id, id, password, url } from "@/src/modules/shared/value-objects";
import type { Password } from "@/src/modules/shared/value-objects/password";
import { type Phone, phone } from "@/src/modules/shared/value-objects/phone";
import { type Email, email, type Username, username } from "../value-objects";

export namespace User {
	export enum UserStatus {
		ACTIVE = "active",
		INACTIVE = "inactive",
		PENDING = "pending",
		BLOCKED = "blocked",
	}

	export enum UserRole {
		ADMIN = "admin",
		USER = "user",
	}

	export type Model = {
		id: Id;
		name: string;
		email: Email;
		username: Username;
		phone: Phone;
		password: Password;
		bio: string | null;
		avatar?: Url;
		status: UserStatus;
		role: UserRole;
		verificationCode?: string;
		verificationCodeExpiresAt?: Date;
		emailVerifiedAt?: Date;
		passwordResetToken?: string;
		passwordResetTokenExpiresAt?: Date;
		createdAt: Date;
		updatedAt: Date;
	};

	export type CreateParams = {
		name: string;
		email: string;
		username: string;
		phone: string;
		password: string;
		avatar?: string;
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			const now = new Date();

			const user: Model = {
				id: id(),
				name: params.name,
				email: email(params.email),
				username: username(params.username),
				phone: phone(params.phone),
				password: password(params.password),
				avatar: params.avatar ? url(params.avatar) : undefined,
				bio: null,
				status: UserStatus.PENDING,
				role: UserRole.USER,
				verificationCode: undefined,
				verificationCodeExpiresAt: undefined,
				emailVerifiedAt: undefined,
				passwordResetToken: undefined,
				passwordResetTokenExpiresAt: undefined,
				createdAt: now,
				updatedAt: now,
			};

			return new Entity(user);
		}

		static fromModel(model: Model): Entity {
			return new Entity(model);
		}

		static generateVerificationCode(): string {
			const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
			let result = "";
			for (let i = 0; i < 8; i++) {
				result += chars.charAt(Math.floor(Math.random() * chars.length));
			}
			return result;
		}

		static generatePasswordResetToken(): string {
			const chars =
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			let result = "";
			for (let i = 0; i < 32; i++) {
				result += chars.charAt(Math.floor(Math.random() * chars.length));
			}
			return result;
		}

		get id(): Id {
			return this.props.id;
		}

		get name(): string {
			return this.props.name;
		}

		get email(): Email {
			return this.props.email;
		}

		get username(): Username {
			return this.props.username;
		}

		get phone(): Phone {
			return this.props.phone;
		}

		get password(): Password {
			return this.props.password;
		}

		get bio(): string | null {
			return this.props.bio;
		}

		get avatar(): Url | undefined {
			return this.props.avatar;
		}

		get status(): UserStatus {
			return this.props.status;
		}

		get role(): UserRole {
			return this.props.role;
		}

		get verificationCode(): string | undefined {
			return this.props.verificationCode;
		}

		get verificationCodeExpiresAt(): Date | undefined {
			return this.props.verificationCodeExpiresAt;
		}

		get emailVerifiedAt(): Date | undefined {
			return this.props.emailVerifiedAt;
		}

		get passwordResetToken(): string | undefined {
			return this.props.passwordResetToken;
		}

		get passwordResetTokenExpiresAt(): Date | undefined {
			return this.props.passwordResetTokenExpiresAt;
		}

		get createdAt(): Date {
			return this.props.createdAt;
		}

		get updatedAt(): Date {
			return this.props.updatedAt;
		}

		activate(): void {
			this.props.status = UserStatus.ACTIVE;
			this.props.updatedAt = new Date();
		}

		deactivate(): void {
			this.props.status = UserStatus.INACTIVE;
			this.props.updatedAt = new Date();
		}

		block(): void {
			this.props.status = UserStatus.BLOCKED;
			this.props.updatedAt = new Date();
		}

		updateBio(bio: string): void {
			this.props.bio = bio;
			this.props.updatedAt = new Date();
		}

		updateAvatar(avatar: string): void {
			this.props.avatar = url(avatar);
			this.props.updatedAt = new Date();
		}

		updateName(name: string): void {
			this.props.name = name;
			this.props.updatedAt = new Date();
		}

		updatePassword(newPassword: string): void {
			this.props.password = password(newPassword);
			this.props.updatedAt = new Date();
		}

		setVerificationCode(code: string, expiresInMinutes: number = 10): void {
			this.props.verificationCode = code;
			const expiresAt = new Date();
			expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
			this.props.verificationCodeExpiresAt = expiresAt;
			this.props.updatedAt = new Date();
		}

		clearVerificationCode(): void {
			this.props.verificationCode = undefined;
			this.props.verificationCodeExpiresAt = undefined;
			this.props.updatedAt = new Date();
		}

		setPasswordResetToken(token: string, expiresInMinutes: number = 60): void {
			this.props.passwordResetToken = token;
			const expiresAt = new Date();
			expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
			this.props.passwordResetTokenExpiresAt = expiresAt;
			this.props.updatedAt = new Date();
		}

		clearPasswordResetToken(): void {
			this.props.passwordResetToken = undefined;
			this.props.passwordResetTokenExpiresAt = undefined;
			this.props.updatedAt = new Date();
		}

		isPasswordResetTokenValid(token: string): boolean {
			if (
				!this.props.passwordResetToken ||
				!this.props.passwordResetTokenExpiresAt
			) {
				return false;
			}

			const now = new Date();
			return (
				this.props.passwordResetToken === token &&
				now < this.props.passwordResetTokenExpiresAt
			);
		}

		isPasswordResetTokenExpired(): boolean {
			if (!this.props.passwordResetTokenExpiresAt) {
				return true;
			}

			return new Date() > this.props.passwordResetTokenExpiresAt;
		}

		verifyEmail(): void {
			this.props.emailVerifiedAt = new Date();
			this.props.status = UserStatus.ACTIVE;
			this.clearVerificationCode();
			this.props.updatedAt = new Date();
		}

		promoteToAdmin(): void {
			this.props.role = UserRole.ADMIN;
			this.props.updatedAt = new Date();
		}

		demoteToUser(): void {
			this.props.role = UserRole.USER;
			this.props.updatedAt = new Date();
		}

		isActive(): boolean {
			return this.props.status === UserStatus.ACTIVE;
		}

		isAdmin(): boolean {
			return this.props.role === UserRole.ADMIN;
		}

		isBlocked(): boolean {
			return this.props.status === UserStatus.BLOCKED;
		}

		isEmailVerified(): boolean {
			return this.props.emailVerifiedAt !== undefined;
		}

		isVerificationCodeValid(code: string): boolean {
			if (
				!this.props.verificationCode ||
				!this.props.verificationCodeExpiresAt
			) {
				return false;
			}

			const now = new Date();
			return (
				this.props.verificationCode === code &&
				now < this.props.verificationCodeExpiresAt
			);
		}

		isVerificationCodeExpired(): boolean {
			if (!this.props.verificationCodeExpiresAt) {
				return true;
			}

			return new Date() > this.props.verificationCodeExpiresAt;
		}

		toJSON(): Model {
			return { ...this.props };
		}
	}
}
