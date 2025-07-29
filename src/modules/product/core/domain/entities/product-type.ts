import { type Id, id, Slug } from "@/src/modules/shared/value-objects";

export namespace ProductType {
	export type Props = {
		id: Id;
		name: string;
		slug: string;
		description?: string;
		organizationId: Id;
		productCategoryId: Id;
		createdById: Id;
		createdAt: Date;
		updatedAt: Date;
	};
	export type Model = Omit<Props, "slug"> & {
		slug: Slug;
	};

	export type CreateParams = {
		name: string;
		description?: string;
		organizationId: Id;
		productCategoryId: Id;
		createdById: Id;
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			const now = new Date();
			const productType: Model = {
				id: id(),
				name: params.name,
				slug: Slug.create(params.name),
				description: params.description,
				organizationId: params.organizationId,
				productCategoryId: params.productCategoryId,
				createdById: params.createdById,
				createdAt: now,
				updatedAt: now,
			};
			return new Entity(productType);
		}

		static fromModel(model: Props): Entity {
			return new Entity({
				...model,
				slug: Slug.create(model.slug),
			});
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
		get organizationId(): Id {
			return this.props.organizationId;
		}
		get productCategoryId(): Id {
			return this.props.productCategoryId;
		}
		get createdById(): Id {
			return this.props.createdById;
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

		updateProductCategory(productCategoryId: Id): void {
			this.props.productCategoryId = productCategoryId;
			this.props.updatedAt = new Date();
		}

		toJSON(): Props {
			return { ...this.props, slug: this.props.slug.toString() };
		}
	}
}
