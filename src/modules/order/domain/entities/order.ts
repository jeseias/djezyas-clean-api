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
		organizationId: Id;
		name: string;
		quantity: number;
		unitAmount: number;
		subtotal: number;

		product?: Product.Model;
		price?: Price.Model;
	};

	export type Model = {
		id: Id;
		userId: Id;
		items: Item[];
		totalAmount: number;
		status: Status;
		paymentIntentId?: string;
		transactionId?: string;
		paidAt?: Date;
		expiredAt?: Date;
		meta?: Record<string, any>;
		createdAt: Date;
		updatedAt: Date;
	};

	export type CreateParams = {
		id?: Id;
		userId: Id;
		items: {
			priceId: Id;
			productId: Id;
			organizationId: Id;
			name: string;
			quantity: number;
			unitAmount: number;
			product?: Product.Model;
			price?: Price.Model;
		}[];
		paymentIntentId?: string;
		transactionId?: string;
		meta?: Record<string, any>;
	};

	export class Entity {
		private readonly props: Model;

		private constructor(model: Model) {
			this.props = model;
		}

		static create(params: CreateParams): Entity {
			const now = new Date();

			const items: Item[] = params.items.map((item) => ({
				priceId: item.priceId,
				productId: item.productId,
				organizationId: item.organizationId,
				name: item.name,
				quantity: item.quantity,
				unitAmount: item.unitAmount,
				subtotal: item.quantity * item.unitAmount,
				product: item.product,
				price: item.price,
			}));

			const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

			const model: Model = {
				id: params.id ?? id(),
				userId: params.userId,
				items,
				totalAmount,
				status: Status.PENDING,
				paymentIntentId: params.paymentIntentId,
				transactionId: params.transactionId,
				meta: params.meta ?? {},
				createdAt: now,
				updatedAt: now,
			};

			return new Entity(model);
		}

		static fromModel(model: Model): Entity {
			return new Entity({ ...model });
		}

		markAsPaid(transactionId?: string): void {
			this.props.status = Status.PAID;
			this.props.paidAt = new Date();
			this.props.updatedAt = new Date();
			if (transactionId) {
				this.props.transactionId = transactionId;
			}
		}

		cancel(): void {
			this.updateStatus(Status.CANCELLED);
		}

		expire(): void {
			this.props.status = Status.EXPIRED;
			this.props.expiredAt = new Date();
			this.props.updatedAt = new Date();
		}

		private updateStatus(status: Status): void {
			this.props.status = status;
			this.props.updatedAt = new Date();
		}

		isPending(): boolean {
			return this.props.status === Status.PENDING;
		}

		isPaid(): boolean {
			return this.props.status === Status.PAID;
		}

		getSnapshot(): Model {
			// Deep clone to avoid mutation from outside
			return JSON.parse(JSON.stringify(this.props));
		}

		getOrganizationIds(): Id[] {
			return [...new Set(this.props.items.map((i) => i.organizationId))];
		}

		getItemsByOrganizationId(orgId: Id): Item[] {
			return this.props.items.filter((i) => i.organizationId === orgId);
		}
	}
}
