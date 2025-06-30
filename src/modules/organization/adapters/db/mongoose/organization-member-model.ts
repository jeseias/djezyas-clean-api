import mongoose, { type Document, Schema } from "mongoose";
import type { OrganizationMember } from "../../../core/domain/entities";

export interface OrganizationMemberDocument extends Document {
	id: string;
	organizationId: string;
	userId: string;
	role: OrganizationMember.Role;
	invitedAt: Date;
	joinedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const organizationMemberSchema = new Schema<OrganizationMemberDocument>(
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
		userId: {
			type: String,
			required: [true, "User ID is required"],
			index: true,
		},
		role: {
			type: String,
			enum: ["owner", "admin", "member"],
			default: "member",
		},
		invitedAt: {
			type: Date,
			default: Date.now,
		},
		joinedAt: {
			type: Date,
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

organizationMemberSchema.index({ id: 1 }, { unique: true });
organizationMemberSchema.index(
	{ organizationId: 1, userId: 1 },
	{ unique: true },
);
organizationMemberSchema.index({ organizationId: 1, role: 1 });
organizationMemberSchema.index({ userId: 1, role: 1 });
organizationMemberSchema.index({ organizationId: 1, joinedAt: 1 });
organizationMemberSchema.index({ createdAt: -1 });

export const OrganizationMemberModel =
	mongoose.model<OrganizationMemberDocument>(
		"OrganizationMember",
		organizationMemberSchema,
	);
