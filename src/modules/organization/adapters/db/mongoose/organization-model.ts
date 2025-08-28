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
	location?: Organization.Location;
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
		location: {
			address: {
				type: String,
				required: [true, "Address is required for location"],
				trim: true,
			},
			city: {
				type: String,
				required: [true, "City is required for location"],
				trim: true,
			},
			state: {
				type: String,
				trim: true,
			},
			country: {
				type: String,
				required: [true, "Country is required for location"],
				trim: true,
			},
			postalCode: {
				type: String,
				trim: true,
			},
			latitude: {
				type: Number,
				required: [true, "Latitude is required for location"],
				min: [-90, "Latitude must be between -90 and 90"],
				max: [90, "Latitude must be between -90 and 90"],
			},
			longitude: {
				type: Number,
				required: [true, "Longitude is required for location"],
				min: [-180, "Longitude must be between -180 and 180"],
				max: [180, "Longitude must be between -180 and 180"],
			},
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
			transform: (_doc, ret) => {
				delete ret.__v;
				delete ret._id;
				return ret;
			},
		},
		toObject: {
			transform: (_doc, ret) => {
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

// Geospatial index for location-based queries
organizationSchema.index({ "location.latitude": 1, "location.longitude": 1 });
organizationSchema.index({ "location.city": 1 });
organizationSchema.index({ "location.country": 1 });

export const OrganizationModel = mongoose.model<OrganizationDocument>(
	"Organization",
	organizationSchema,
);
