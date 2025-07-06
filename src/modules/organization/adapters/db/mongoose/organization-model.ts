import mongoose, { type Document, Schema } from "mongoose";
import { Organization } from "@/src/modules/organization/core/domain/entities";

export interface OrganizationDocument extends Document {
	id: string;
	name: string;
	slug: string;
	ownerId: string;
	status: Organization.Status;
	plan: Organization.PlanType;
	logoUrl?: string;
	settings: Record<string, unknown>;
	meta: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}

const organizationSchema = new Schema<OrganizationDocument>(
	{
		id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: [true, "Organization name is required"],
			trim: true,
			minlength: [2, "Organization name must be at least 2 characters long"],
			maxlength: [100, "Organization name cannot exceed 100 characters"],
		},
		slug: {
			type: String,
			required: [true, "Organization slug is required"],
			trim: true,
			lowercase: true,
		},
		ownerId: {
			type: String,
			required: [true, "Owner ID is required"],
		},
		status: {
			type: String,
			enum: Object.values(Organization.Status),
			default: Organization.Status.ACTIVE,
		},
		plan: {
			type: String,
			enum: Object.values(Organization.PlanType),
			default: Organization.PlanType.FREE,
		},
		logoUrl: {
			type: String,
			trim: true,
		},
		settings: {
			type: Schema.Types.Mixed,
			default: {},
		},
		meta: {
			type: Schema.Types.Mixed,
			default: {},
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

organizationSchema.index({ id: 1 }, { unique: true });
organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ ownerId: 1 });
organizationSchema.index({ status: 1 });
organizationSchema.index({ plan: 1 });
organizationSchema.index({ createdAt: -1 });

organizationSchema.index({ ownerId: 1, status: 1 });
organizationSchema.index({ slug: 1, status: 1 });

export const OrganizationModel = mongoose.model<OrganizationDocument>(
	"Organization",
	organizationSchema,
);
