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

	export type Location = {
		address: string;
		city: string;
		state?: string;
		country: string;
		postalCode?: string;
		latitude: number;
		longitude: number;
	};

	export type Props = {
		id: Id;
		name: string;
		slug: string;
		ownerId: Id;
		members?: OrganizationMember.Model[];
		createdAt: Date;
		updatedAt: Date;
		status?: Status;
		plan: PlanType;
		logoUrl?: Url | string;
		location?: Location;
		settings?: Settings;
		meta?: Record<string, unknown>;
	};

	export type Model = Omit<Props, "slug"> & {
		slug: Slug;
	};

	export type CreateParams = {
		name: string;
		ownerId: Id;
		members?: OrganizationMember.Model[];
		status?: Status;
		plan?: PlanType;
		logoUrl?: string;
		location?: Location;
		settings?: Settings;
		meta?: Record<string, unknown>;
	};

	export type Store = {
		slug: string;
		name: string;
		logoUrl?: Url;
		location?: Location;
		createdAt: Date;
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
				location: params.location,
				settings: params.settings ?? {},
				meta: params.meta ?? {},
			};
			return new Entity(org);
		}

		static fromModel(model: Props): Entity {
			const normalizedModel: Model = {
				...model,
				slug: Slug.create(model.slug),
			};
			return new Entity(normalizedModel);
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
		get location(): Location | undefined {
			return this.props.location;
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
			this.props.slug = Slug.create(name);
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

		updateLocation(location: Location): void {
			this.props.location = location;
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

		getSnapshot(type: "store" | "props" = "props"): Props | Store {
			if (type === "store") {
				return {
					slug: this.slug.toString(),
					name: this.name,
					logoUrl: this.logoUrl,
					location: this.location,
					createdAt: this.createdAt,
				};
			}

			return {
				...this.props,
				slug: this.slug.toString(),
			};
		}
	}
}
