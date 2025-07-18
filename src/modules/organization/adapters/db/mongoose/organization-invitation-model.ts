import mongoose, { type Document, Schema } from "mongoose";
import type { OrganizationInvitation } from "../../../core/domain/entities/organization-invitation";
import { OrganizationModel } from "./organization-model";

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
		},
		organizationId: {
			type: String,
			required: [true, "Organization ID is required"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			trim: true,
			lowercase: true,
		},
		role: {
			type: String,
			enum: ["admin", "member"],
			default: "member",
		},
		token: {
			type: String,
			required: [true, "Token is required"],
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

organizationInvitationSchema.virtual("organization", {
	ref: "Organization",
	localField: "organizationId",
	foreignField: "id",
	justOne: true,
});

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
