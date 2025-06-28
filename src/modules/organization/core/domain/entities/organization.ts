import {
	type Id,
	id,
	Slug,
	type Url,
	url,
} from "@/src/modules/shared/value-objects";
import type { OrganizationMember } from "./organization-member";

export namespace Organization {
	export enum Status {
		ACTIVE = "active",
		DISABLED = "disabled",
		PENDING = "pending",
	}

	export enum PlanType {
		FREE = "free",
		PRO = "pro",
		ENTERPRISE = "enterprise",
	}

	export enum SettingKey {
		THEME = "theme",
		TIMEZONE = "timezone",
		NOTIFICATIONS = "notifications",
	}

	export type Settings = Partial<Record<SettingKey, unknown>>;

	export type Model = {
		id: Id;
		name: string;
		slug: Slug;
		ownerId: Id;
		members?: OrganizationMember.Model[];
		createdAt: Date;
		updatedAt: Date;
		status?: Status;
		plan?: PlanType;
		logoUrl?: Url | string;
		settings?: Settings;
		meta?: Record<string, unknown>;
	};

	export type CreateParams = {
		name: string;
		ownerId: Id;
		members?: OrganizationMember.Model[];
		status?: Status;
		plan?: PlanType;
		logoUrl?: string;
		settings?: Settings;
		meta?: Record<string, unknown>;
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			const now = new Date();
			const org: Model = {
				id: id(),
				name: params.name,
				slug: Slug.create(params.name),
				ownerId: params.ownerId,
				members: params.members ?? [],
				createdAt: now,
				updatedAt: now,
				status: params.status ?? Status.ACTIVE,
				plan: params.plan ?? PlanType.FREE,
				logoUrl: params.logoUrl ? url(params.logoUrl) : undefined,
				settings: params.settings ?? {},
				meta: params.meta ?? {},
			};
			return new Entity(org);
		}

		static fromModel(model: Model): Entity {
			return new Entity(model);
		}

		get id(): Id {
			return this.props.id;
		}
		get name(): string {
			return this.props.name;
		}
		get slug(): Slug {
			return this.props.slug;
		}
		get ownerId(): Id {
			return this.props.ownerId;
		}
		get members(): OrganizationMember.Model[] {
			return this.props.members ?? [];
		}
		get createdAt(): Date {
			return this.props.createdAt;
		}
		get updatedAt(): Date {
			return this.props.updatedAt;
		}
		get status(): Status | undefined {
			return this.props.status;
		}
		get plan(): PlanType | undefined {
			return this.props.plan;
		}
		get logoUrl(): Url | string | undefined {
			return this.props.logoUrl;
		}
		get settings(): Settings | undefined {
			return this.props.settings;
		}
		get meta(): Record<string, unknown> | undefined {
			return this.props.meta;
		}

		addMember(member: OrganizationMember.Model): void {
			this.props.members = [...(this.props.members ?? []), member];
			this.props.updatedAt = new Date();
		}

		updateName(name: string): void {
			this.props.name = name;
			this.props.updatedAt = new Date();
		}

		updateStatus(status: Status): void {
			this.props.status = status;
			this.props.updatedAt = new Date();
		}

		updatePlan(plan: PlanType): void {
			this.props.plan = plan;
			this.props.updatedAt = new Date();
		}

		updateLogoUrl(logoUrl: string): void {
			this.props.logoUrl = url(logoUrl);
			this.props.updatedAt = new Date();
		}

		updateSettings(settings: Settings): void {
			this.props.settings = settings;
			this.props.updatedAt = new Date();
		}

		updateMeta(meta: Record<string, unknown>): void {
			this.props.meta = meta;
			this.props.updatedAt = new Date();
		}

		toJSON(): Model {
			return { ...this.props };
		}
	}
}
