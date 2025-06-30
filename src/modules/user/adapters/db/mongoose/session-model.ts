import mongoose, { type Document, Schema } from "mongoose";

export interface SessionDocument extends Document {
	id: string;
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
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	lastUsedAt: Date;
}

const deviceInfoSchema = new Schema({
	userAgent: {
		type: String,
		required: true,
	},
	ipAddress: {
		type: String,
		required: true,
	},
	deviceType: {
		type: String,
		enum: ["mobile", "desktop", "tablet"],
	},
	browser: {
		type: String,
	},
	os: {
		type: String,
	},
});

const sessionSchema = new Schema<SessionDocument>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
		},
		userId: {
			type: String,
			required: true,
			index: true,
		},
		accessToken: {
			type: String,
			required: true,
			unique: true,
		},
		refreshToken: {
			type: String,
			required: true,
			unique: true,
		},
		accessTokenExpiresAt: {
			type: Date,
			required: true,
		},
		refreshTokenExpiresAt: {
			type: Date,
			required: true,
		},
		deviceInfo: {
			type: deviceInfoSchema,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastUsedAt: {
			type: Date,
			default: Date.now,
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

sessionSchema.index({ id: 1 }, { unique: true });
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ createdAt: -1 });
sessionSchema.index({ lastUsedAt: -1 });

export const SessionModel = mongoose.model<SessionDocument>(
	"Session",
	sessionSchema,
);
