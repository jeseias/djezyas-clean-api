import type { Product } from "@/src/modules/product/core/domain/entities";
import { type Id, id } from "@/src/modules/shared/value-objects";

export namespace Cart {
	export type Item = {
		productId: Id;
		product?: Product.Model;
		quantity: number;
	};

	export type EnrichedItem = Omit<Item, "product"> & {
		product: {
			slug: string;
			name: Product.Model["name"];
			imageUrl: Product.Model["imageUrl"];
			price: {
				currency: string;
				unitAmount: number;
			};
		};
	};

	export type Model = {
		id: Id;
		userId: Id;
		items: Array<Item>;
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

		addItem(productId: Id, quantity: number): Cart.Entity {
			const existingIndex = this.props.items.findIndex(
				(item) => item.productId === productId,
			);

			let newItems: Item[];
			if (existingIndex !== -1) {
				newItems = [...this.props.items];
				newItems[existingIndex] = {
					...newItems[existingIndex],
					quantity: newItems[existingIndex].quantity + quantity,
				};
			} else {
				newItems = [...this.props.items, { productId, quantity }];
			}

			return new Cart.Entity({
				id: this.props.id,
				userId: this.props.userId,
				items: newItems,
				createdAt: this.props.createdAt,
				updatedAt: new Date(),
			});
		}

		updateItem(productId: Id, quantity: number): Cart.Entity {
			const productIdStr = productId.toString();
			const existingIndex = this.props.items.findIndex(
				(item) => item.productId === productIdStr,
			);
			if (existingIndex === -1) throw new Error("Item not found in cart");

			const updatedItems = [...this.props.items];
			updatedItems[existingIndex] = {
				...updatedItems[existingIndex],
				quantity,
			};

			return new Cart.Entity({
				id: this.props.id,
				userId: this.props.userId,
				items: updatedItems,
				createdAt: this.props.createdAt,
				updatedAt: new Date(),
			});
		}

		removeItem(productId: Id): Cart.Entity {
			const productIdStr = productId.toString();
			const filteredItems = this.props.items.filter(
				(item) => item.productId !== productIdStr,
			);

			return new Cart.Entity({
				id: this.props.id,
				userId: this.props.userId,
				items: filteredItems,
				createdAt: this.props.createdAt,
				updatedAt: new Date(),
			});
		}

		clear(): Cart.Entity {
			return new Cart.Entity({
				id: this.props.id,
				userId: this.props.userId,
				items: [],
				createdAt: this.props.createdAt,
				updatedAt: new Date(),
			});
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
