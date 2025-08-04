import type {
	Price,
	Product,
} from "@/src/modules/product/core/domain/entities";
import { type Id, id } from "@/src/modules/shared/value-objects";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";

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
		organizationId: Id;
		items: Item[];
		totalAmount: number;
		status: Status;
		paymentIntentId?: string;
		transactionId?: string;
		paidAt?: Date;
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

			const itemOrganizationIds = new Set(params.items.map(item => item.organizationId));
			if (itemOrganizationIds.size > 1) {
				throw new AppError(
					"All items must belong to the same organization",
					400,
					ErrorCode.INVALID_INPUT
				);
			}

			const firstItemOrganizationId = params.items[0]?.organizationId;
			if (firstItemOrganizationId && firstItemOrganizationId !== params.organizationId) {
				throw new AppError(
					"All items must belong to the same organization",
					400,
					ErrorCode.INVALID_INPUT
				);
			}

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

		getSnapshot(): Model {
			// Deep clone to avoid mutation from outside
			return JSON.parse(JSON.stringify(this.props));
		}
	}
}
