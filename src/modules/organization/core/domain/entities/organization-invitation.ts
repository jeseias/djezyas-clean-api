import { v4 as uuidv4 } from "uuid";
import { type Id, id } from "@/src/modules/shared/value-objects";

export namespace OrganizationInvitation {
	export type Status = "pending" | "accepted" | "expired";

  export type OrganizationSummary = {
    id: Id;
    name: string;
    slug: string;
    logoUrl?: string;
    plan?: string;
    status?: string;
    createdAt?: Date;
  }

	export type Model = {
		id: Id;
		organizationId: Id;
    organization?: OrganizationSummary
		email: string;
		role: "admin" | "member";
		token: string;
		invitedAt: Date;
		acceptedAt?: Date;
		status: Status;
	};

  export type ModelWithOrganization = Model & {
    organization: OrganizationSummary;
  }

	export type CreateParams = {
		organizationId: Id;
		email: string;
		role: "admin" | "member";
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			return new Entity({
				id: id(),
				organizationId: params.organizationId,
				email: params.email,
				role: params.role,
				token: uuidv4(),
				invitedAt: new Date(),
				status: "pending",
			});
		}

		static fromModel(model: Model): Entity {
			return new Entity(model);
		}

		get id(): Id {
			return this.props.id;
		}
		get organizationId(): Id {
			return this.props.organizationId;
		}
		get email(): string {
			return this.props.email;
		}
		get role(): "admin" | "member" {
			return this.props.role;
		}
		get token(): string {
			return this.props.token;
		}
		get invitedAt(): Date {
			return this.props.invitedAt;
		}
		get acceptedAt(): Date | undefined {
			return this.props.acceptedAt;
		}
		get status(): Status {
			return this.props.status;
		}
    get organization(): OrganizationSummary | undefined {
      return this.props.organization;
    }

		accept(): void {
			this.props.status = "accepted";
			this.props.acceptedAt = new Date();
		}

		expire(): void {
			this.props.status = "expired";
		}

		refresh(): void {
			this.props.token = uuidv4();
			this.props.invitedAt = new Date();
			this.props.status = "pending";
			this.props.acceptedAt = undefined;
		}

		toJSON(): Model {
			return { ...this.props };
		}
	}
}
