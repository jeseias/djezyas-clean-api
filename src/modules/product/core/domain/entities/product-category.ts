import { type Id, id, Slug } from "@/src/modules/shared/value-objects";

export namespace ProductCategory {
	export type Model = {
		id: Id;
		name: string;
		slug: Slug;
		description?: string;
		createdAt: Date;
		updatedAt: Date;
	};

	export type CreateParams = {
		name: string;
		description?: string;
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			const now = new Date();
			const productCategory: Model = {
				id: id(),
				name: params.name,
				slug: Slug.create(params.name),
				description: params.description,
				createdAt: now,
				updatedAt: now,
			};
			return new Entity(productCategory);
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
		get description(): string | undefined {
			return this.props.description;
		}
		get createdAt(): Date {
			return this.props.createdAt;
		}
		get updatedAt(): Date {
			return this.props.updatedAt;
		}

		updateName(name: string): void {
			this.props.name = name;
			this.props.slug = Slug.create(name);
			this.props.updatedAt = new Date();
		}

		updateDescription(description: string): void {
			this.props.description = description;
			this.props.updatedAt = new Date();
		}

		toJSON(): Model {
			return { ...this.props };
		}
	}
}
