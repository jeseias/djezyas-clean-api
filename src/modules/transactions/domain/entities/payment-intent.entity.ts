import { now } from "@/src/modules/shared";
import { type Id, id } from "@/src/modules/shared/value-objects";

export namespace PaymentIntent {
	export type Status =
		| "pending"
		| "succeeded"
		| "failed"
		| "expired"
		| "cancelled";

	export enum Provider {
		MULTICAIXA_EXPRESS = "multicaixa_express",
		STRIPE = "stripe",
		AFRIMONEY = "afrimoney",
	}

	export interface Metadata {
		providerPayload?: Record<string, any>;
		[extra: string]: any;
	}

	export interface Props {
		id?: Id;
		userId: Id;
		orderIds: Id[];
		amount: number;
		provider: Provider;
		status?: Status;
		transactionId?: string;
		expiresAt?: Date;
		createdAt?: Date;
		updatedAt?: Date;
		metadata?: Metadata;
	}

	export interface Model extends Props {
		id: Id;
		status: Status;
		createdAt: Date;
		updatedAt: Date;
	}

	export class Entity {
		private props: PaymentIntent.Model;

		private constructor(props: PaymentIntent.Model) {
			this.props = props;
		}

		static create(props: PaymentIntent.Props): Entity {
			const nowDate = now();
			return new Entity({
				id: props.id ?? id(),
				userId: props.userId,
				orderIds: props.orderIds,
				amount: props.amount,
				provider: props.provider,
				status: props.status ?? "pending",
				expiresAt: props.expiresAt,
				metadata: props.metadata ?? {},
				createdAt: props.createdAt ?? nowDate,
				updatedAt: props.updatedAt ?? nowDate,
			});
		}

		static fromModel(model: PaymentIntent.Model): Entity {
			return new Entity(model);
		}

		getSnapshot(): PaymentIntent.Model {
			return this.props;
		}

		updateStatus(status: PaymentIntent.Status) {
			this.props.status = status;
			this.props.updatedAt = now();
		}

		isExpired(): boolean {
			return this.props.expiresAt !== undefined && this.props.expiresAt < now();
		}
	}
}
