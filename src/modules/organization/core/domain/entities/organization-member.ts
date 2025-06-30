import { type Id, id } from "@/src/modules/shared/value-objects";

export namespace OrganizationMember {
	export type Role = "owner" | "admin" | "member";

	export type Model = {
		id: Id;
		organizationId: Id;
		userId: Id;
		role: Role;
		invitedAt: Date;
		joinedAt?: Date;
	};

	export type CreateParams = {
		organizationId: Id;
		userId: Id;
		role: Role;
		invitedAt?: Date;
		joinedAt?: Date;
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			return new Entity({
				id: id(),
				organizationId: params.organizationId,
				userId: params.userId,
				role: params.role,
				invitedAt: params.invitedAt ?? new Date(),
				joinedAt: params.joinedAt,
			});
		}

		static fromModel(model: Model): Entity {
			return new Entity(model);
		}

		get organizationId(): Id {
			return this.props.organizationId;
		}
		get userId(): Id {
			return this.props.userId;
		}
		get role(): Role {
			return this.props.role;
		}
		get invitedAt(): Date {
			return this.props.invitedAt;
		}
		get joinedAt(): Date | undefined {
			return this.props.joinedAt;
		}

		join(): void {
			this.props.joinedAt = new Date();
		}

		toJSON(): Model {
			return { ...this.props };
		}
	}
}
