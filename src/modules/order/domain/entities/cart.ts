import type { Product } from "@/src/modules/product/core/domain/entities";
import { type Id, id } from "@/src/modules/shared/value-objects";

export namespace Cart {
	export type Item = {
		productId: Id;
		product?: Product.Model;
		quantity: number;
	};

	export type Model = {
		id: Id;
		userId: Id;
		items: Item[];
		createdAt: Date;
		updatedAt: Date;
	};

	export type CreateParams = {
		id?: Id;
		userId: Id;
		items: Item[];
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			const now = new Date();

			return new Entity({
				id: params.id ?? id(),
				userId: params.userId,
				items: params.items,
				createdAt: now,
				updatedAt: now,
			});
		}

		static fromModel(model: Model): Entity {
			return new Entity(model);
		}

		isEmpty(): boolean {
			return this.props.items.length === 0;
		}

    get id(): Id {
      return this.props.id;
    }

		get userId(): Id {
			return this.props.userId;
		}

		get items(): Item[] {
			return this.props.items;
		}

		get createdAt(): Date {
			return this.props.createdAt;
		}

		get updatedAt(): Date {
			return this.props.updatedAt;
		}

		get totalItems(): number {
			return this.props.items.reduce((sum, item) => sum + item.quantity, 0);
		}

		addItem(productId: Id, quantity: number): void {
			const existing = this.props.items.find(
				(item) => item.productId === productId,
			);
			if (existing) {
				existing.quantity += quantity;
			} else {
				this.props.items.push({ productId, quantity });
			}
			this.props.updatedAt = new Date();
		}

		updateItem(productId: Id, quantity: number): void {
			const item = this.props.items.find(
				(item) => item.productId === productId,
			);
			if (!item) throw new Error("Item not found in cart");
			item.quantity = quantity;
			this.props.updatedAt = new Date();
		}

		removeItem(productId: Id): void {
			this.props.items = this.props.items.filter(
				(item) => item.productId !== productId,
			);
			this.props.updatedAt = new Date();
		}

		clear(): void {
			this.props.items = [];
			this.props.updatedAt = new Date();
		}

		getSnapshot(): Model {
			return {
				...this.props,
				createdAt: this.props.createdAt,
				updatedAt: this.props.updatedAt,
			};
		}
	}
}
