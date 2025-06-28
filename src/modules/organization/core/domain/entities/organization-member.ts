import type { Id } from "@/src/modules/shared/value-objects";

export namespace OrganizationMember {
	export type Role = "owner" | "admin" | "member";

	export type Model = {
		userId: Id;
		role: Role;
		invitedAt: Date;
		joinedAt?: Date;
	};

	export type CreateParams = {
		userId: Id;
		role: Role;
		invitedAt?: Date;
		joinedAt?: Date;
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			return new Entity({
				userId: params.userId,
				role: params.role,
				invitedAt: params.invitedAt ?? new Date(),
				joinedAt: params.joinedAt,
			});
		}

		static fromModel(model: Model): Entity {
			return new Entity(model);
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
