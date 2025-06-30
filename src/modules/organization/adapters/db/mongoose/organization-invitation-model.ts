import mongoose, { type Document, Schema } from "mongoose";
import type { OrganizationInvitation } from "../../../core/domain/entities/organization-invitation";

export interface OrganizationInvitationDocument extends Document {
	id: string;
	organizationId: string;
	email: string;
	role: "admin" | "member";
	token: string;
	invitedAt: Date;
	acceptedAt?: Date;
	status: OrganizationInvitation.Status;
	createdAt: Date;
	updatedAt: Date;
}

const organizationInvitationSchema = new Schema<OrganizationInvitationDocument>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
		},
		organizationId: {
			type: String,
			required: [true, "Organization ID is required"],
			index: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			trim: true,
			lowercase: true,
			index: true,
		},
		role: {
			type: String,
			enum: ["admin", "member"],
			default: "member",
		},
		token: {
			type: String,
			required: [true, "Token is required"],
			unique: true,
			index: true,
		},
		invitedAt: {
			type: Date,
			default: Date.now,
		},
		acceptedAt: {
			type: Date,
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "expired"],
			default: "pending",
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

organizationInvitationSchema.index({ id: 1 }, { unique: true });
organizationInvitationSchema.index(
	{ organizationId: 1, email: 1 },
	{ unique: true },
);
organizationInvitationSchema.index({ organizationId: 1, status: 1 });
organizationInvitationSchema.index({ email: 1, status: 1 });
organizationInvitationSchema.index({ token: 1 }, { unique: true });
organizationInvitationSchema.index({ invitedAt: -1 });
organizationInvitationSchema.index({ acceptedAt: 1 });

export const OrganizationInvitationModel =
	mongoose.model<OrganizationInvitationDocument>(
		"OrganizationInvitation",
		organizationInvitationSchema,
	);
