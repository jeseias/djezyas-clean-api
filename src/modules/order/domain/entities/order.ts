import type { Organization } from "@/src/modules/organization/core/domain/entities";
import type {
	Price,
	Product,
} from "@/src/modules/product/core/domain/entities";
import { type Id, id } from "@/src/modules/shared/value-objects";

export namespace Order {
	export enum PaymentStatus {
		PENDING = "pending",
		PAID = "paid",
		REFUNDED = "refunded",
		FAILED = "failed",
	}

	export enum FulfillmentStatus {
		NEW = "new",
		PICKING = "picking",
		PACKED = "packed",
		IN_DELIVERY = "in_delivery",
		DELIVERED = "delivered",
		CANCELLED = "cancelled",
		RETURNED = "returned",
		FAILED_DELIVERY = "failed_delivery",
		ISSUES = "issues",
		EXPIRED = "expired",
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
		code: string;
		userId: Id;
		organizationId: Id;
		organization: Organization.Model;
		items: Item[];
		totalAmount: number;
		paymentStatus: PaymentStatus;
		fulfillmentStatus: FulfillmentStatus;
		paymentIntentId?: string;
		transactionId?: string;
		paidAt?: Date;
		clientConfirmedIsDelivered: boolean;
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

	export const generateOrderCode = (): string => {
		const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const randomLetters =
			letters.charAt(Math.floor(Math.random() * letters.length)) +
			letters.charAt(Math.floor(Math.random() * letters.length));

		const now = new Date();
		const year = now.getFullYear().toString().slice(-2);
		const month = (now.getMonth() + 1).toString().padStart(2, "0");
		const day = now.getDate().toString().padStart(2, "0");

		const randomNumbers = Math.floor(Math.random() * 10000)
			.toString()
			.padStart(4, "0");

		return `${randomLetters}-${year}${month}${day}-${randomNumbers}`;
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
				code: generateOrderCode(),
				userId: params.userId,
				organizationId: params.organizationId,
				organization: null as any,
				items,
				totalAmount,
				clientConfirmedIsDelivered: false,
				paymentStatus: PaymentStatus.PENDING,
				fulfillmentStatus: FulfillmentStatus.NEW,
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
			this.props.paymentStatus = PaymentStatus.PAID;
			this.props.paidAt = new Date();
			if (transactionId) {
				this.props.transactionId = transactionId;
			}
		}

		cancel(reason?: string): void {
			this.props.fulfillmentStatus = FulfillmentStatus.CANCELLED;
			this.props.cancelledAt = new Date();
			if (reason) {
				this.props.meta = {
					...this.props.meta,
					cancelReason: reason,
				};
			}
		}

		expire(): void {
			this.props.fulfillmentStatus = FulfillmentStatus.EXPIRED;
			this.props.expiredAt = new Date();
		}

		markAsInDelivery(): void {
			this.props.fulfillmentStatus = FulfillmentStatus.IN_DELIVERY;
			this.props.inDeliveryAt = new Date();
		}

		markAsClientConfirmedDelivery(): void {
			this.props.clientConfirmedIsDelivered = true;
			this.props.clientConfirmedDeliveryAt = new Date();
		}

		isNew(): boolean {
			return this.props.fulfillmentStatus === FulfillmentStatus.NEW;
		}

		isPaymentPending(): boolean {
			return this.props.paymentStatus === PaymentStatus.PENDING;
		}

		isPaid(): boolean {
			return this.props.paymentStatus === PaymentStatus.PAID;
		}

		isCancelled(): boolean {
			return this.props.fulfillmentStatus === FulfillmentStatus.CANCELLED;
		}

		isExpired(): boolean {
			return this.props.fulfillmentStatus === FulfillmentStatus.EXPIRED;
		}

		isInDelivery(): boolean {
			return this.props.fulfillmentStatus === FulfillmentStatus.IN_DELIVERY;
		}

		isClientConfirmedDelivery(): boolean {
			return this.props.clientConfirmedIsDelivered;
		}

		getSnapshot(): Model {
			return {
				id: this.props.id,
				code: this.props.code,
				userId: this.props.userId,
				organizationId: this.props.organizationId,
				organization: this.props.organization,
				items: this.props.items,
				totalAmount: this.props.totalAmount,
				paymentStatus: this.props.paymentStatus,
				fulfillmentStatus: this.props.fulfillmentStatus,
				clientConfirmedIsDelivered: this.props.clientConfirmedIsDelivered,
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
