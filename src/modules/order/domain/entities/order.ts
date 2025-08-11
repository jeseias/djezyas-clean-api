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
		IN_DELIVERY = "in_delivery",
		CLIENT_CONFIRMED_DELIVERY = "client_confirmed_delivery",
	}

	export type Item = {
		priceId: Id;
		productId: Id;
		name: string;
		quantity: number;
		unitAmount: number;
		subtotal: number;
		product: Product.Props;
		price: Price.Model;
	};

	export type CreateOrderItemParams = Item;

	export type Model = {
		id: Id;
		userId: Id;
		organizationId: Id;
		items: Item[];
		totalAmount: number;
		status: Status;
		paymentIntentId?: string;
		transactionId?: string;
		paidAt?: Date;
		inDeliveryAt?: Date;
		clientConfirmedDeliveryAt?: Date;
		expiredAt?: Date;
		cancelledAt?: Date;
		meta?: Record<string, any>;
		createdAt: Date;
		updatedAt: Date;
	};

	export type CreateParams = {
		id?: Id;
		userId: Id;
		organizationId: Id;
		items: Array<CreateOrderItemParams>;
		paymentIntentId?: string;
		transactionId?: string;
		meta?: Record<string, any>;
	};

	export const createOrderItem = (item: CreateOrderItemParams): Item => {
		return {
			priceId: item.priceId,
			productId: item.productId,
			name: item.name,
			quantity: item.quantity,
			price: item.price,
			product: item.product,
			unitAmount: item.unitAmount,
			subtotal: item.quantity * item.unitAmount,
		};
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
				organizationId: params.organizationId,
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

		get organizationId(): Id {
			return this.props.organizationId;
		}

		markAsPaid(transactionId?: string): void {
			this.updateStatus(Status.PAID);
			this.props.paidAt = new Date();
			if (transactionId) {
				this.props.transactionId = transactionId;
			}
		}

		cancel(reason?: string): void {
			this.updateStatus(Status.CANCELLED);
			this.props.cancelledAt = new Date();
			if (reason) {
				this.props.meta = {
					...this.props.meta,
					cancelReason: reason,
				};
			}
		}

		expire(): void {
			this.updateStatus(Status.EXPIRED);
			this.props.expiredAt = new Date();
		}

		markAsInDelivery(): void {
			this.updateStatus(Status.IN_DELIVERY);
			this.props.inDeliveryAt = new Date();
		}

		markAsClientConfirmedDelivery(): void {
			this.updateStatus(Status.CLIENT_CONFIRMED_DELIVERY);
			this.props.clientConfirmedDeliveryAt = new Date();
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

		isCancelled(): boolean {
			return this.props.status === Status.CANCELLED;
		}

		isExpired(): boolean {
			return this.props.status === Status.EXPIRED;
		}

		isInDelivery(): boolean {
			return this.props.status === Status.IN_DELIVERY;
		}

		isClientConfirmedDelivery(): boolean {
			return this.props.status === Status.CLIENT_CONFIRMED_DELIVERY;
		}

		getSnapshot(): Model {
			return {
				id: this.props.id,
				userId: this.props.userId,
				organizationId: this.props.organizationId,
				items: this.props.items,
				totalAmount: this.props.totalAmount,
				status: this.props.status,
				paymentIntentId: this.props.paymentIntentId,
				transactionId: this.props.transactionId,
				paidAt: this.props.paidAt,
				inDeliveryAt: this.props.inDeliveryAt,
				clientConfirmedDeliveryAt: this.props.clientConfirmedDeliveryAt,
				expiredAt: this.props.expiredAt,
				cancelledAt: this.props.cancelledAt,
				meta: this.props.meta,
				createdAt: this.props.createdAt,
				updatedAt: this.props.updatedAt,
			};
		}
	}
}
