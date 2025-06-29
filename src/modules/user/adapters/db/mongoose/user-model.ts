import mongoose, { type Document, Schema } from "mongoose";
import { User } from "../../../core/domain/entities/user";

export interface UserDocument extends Document {
	id: string;
	name: string;
	email: string;
	username: string;
	phone: string;
	password: string;
	bio: string | null;
	avatar?: string;
	status: User.UserStatus;
	role: User.UserRole;
	verificationCode?: string;
	verificationCodeExpiresAt?: Date;
	emailVerifiedAt?: Date;
	passwordResetToken?: string;
	passwordResetTokenExpiresAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters long"],
			maxlength: [100, "Name cannot exceed 100 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
		},
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: true,
			trim: true,
			minlength: [3, "Username must be at least 3 characters long"],
			maxlength: [30, "Username cannot exceed 30 characters"],
		},
		phone: {
			type: String,
			required: [true, "Phone number is required"],
			trim: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [7, "Password must be at least 7 characters long"],
		},
		bio: {
			type: String,
			default: null,
			maxlength: [500, "Bio cannot exceed 500 characters"],
		},
		avatar: {
			type: String,
		},
		status: {
			type: String,
			enum: Object.values(User.UserStatus),
			default: User.UserStatus.PENDING,
		},
		role: {
			type: String,
			enum: Object.values(User.UserRole),
			default: User.UserRole.USER,
		},
		verificationCode: {
			type: String,
			select: false, 
		},
		verificationCodeExpiresAt: {
			type: Date,
			select: false,
		},
		emailVerifiedAt: {
			type: Date,
		},
		passwordResetToken: {
			type: String,
			select: false,
		},
		passwordResetTokenExpiresAt: {
			type: Date,
			select: false,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (doc, ret) => {
				delete ret.__v;
				delete ret._id;
				return ret;
			},
		},
		toObject: {
			transform: (doc, ret) => {
				delete ret.__v;
				delete ret._id;
				return ret;
			},
		},
	},
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

userSchema.index({ email: 1, status: 1 });
userSchema.index({ username: 1, status: 1 });

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
