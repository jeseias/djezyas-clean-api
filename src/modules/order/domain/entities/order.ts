import type {
	Price,
	Product,
} from "@/src/modules/product/core/domain/entities";
import { type Id, id } from "@/src/modules/shared/value-objects";

export namespace Order {
	export enum Status {
		PENDING = "pending",
		PAID = "paid",
		CANCELLED = "cancelled",
		EXPIRED = "expired",
	}

	export type Item = {
		priceId: Id;
		productId: Id;
		product?: Product.Model;
		price?: Price.Model;
		name: string;
		quantity: number;
		unitAmount: number;
		subtotal: number;
	};

	export type Model = {
		id: Id;
		userId: Id;
		organizationId: Id;
		items: Item[];
		totalAmount: number;
		status: Status;
		meta?: Record<string, any>;
		createdAt: Date;
		updatedAt: Date;
	};

	export type CreateParams = {
		id?: Id;
		userId: Id;
		organizationId: Id;
		items: {
			priceId: Id;
			productId: Id;
			name: string;
			quantity: number;
			unitAmount: number;
			product?: Product.Model;
			price?: Price.Model;
		}[];
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			const now = new Date();

			const items = params.items.map((item) => {
				const subtotal = item.quantity * item.unitAmount;
				return {
					priceId: item.priceId,
					productId: item.productId,
					product: item.product,
					price: item.price,
					name: item.name,
					quantity: item.quantity,
					unitAmount: item.unitAmount,
					subtotal,
				};
			});

			const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

			const order: Model = {
				id: params.id ?? id(),
				userId: params.userId,
				organizationId: params.organizationId,
				items,
				totalAmount,
				status: Status.PENDING,
				createdAt: now,
				updatedAt: now,
			};

			return new Entity(order);
		}

		static fromModel(model: Model): Entity {
			return new Entity(model);
		}

		markAsPaid(): void {
			this.props.status = Status.PAID;
			this.props.updatedAt = new Date();
		}

		cancel(): void {
			this.props.status = Status.CANCELLED;
			this.props.updatedAt = new Date();
		}

		expire(): void {
			this.props.status = Status.EXPIRED;
			this.props.updatedAt = new Date();
		}

		isPending(): boolean {
			return this.props.status === Status.PENDING;
		}

		isPaid(): boolean {
			return this.props.status === Status.PAID;
		}

		getSnapshot(): Model {
			return { ...this.props };
		}
	}
}
