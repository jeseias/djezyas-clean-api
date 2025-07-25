import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { type Id, id } from "@/src/modules/shared/value-objects";
import type { Product } from "./product";

export namespace Price {
	export enum Type {
		REGULAR = "regular",
		SALE = "sale",
		WHOLESALE = "wholesale",
		BULK = "bulk",
	}

	export enum Status {
		ACTIVE = "active",
		INACTIVE = "inactive",
		EXPIRED = "expired",
	}

	export type Model = {
		id: Id;
		productId: Id;
		product?: Product.Model;
		currency: string;
		unitAmount: number;
		type: Type;
		status: Status;
		validFrom?: Date;
		validUntil?: Date;
		createdAt: Date;
		updatedAt: Date;
	};

	export type CreateParams = {
		id?: Id;
		productId: Id;
		currency: string;
		unitAmount: number;
		type?: Type;
		status?: Status;
		validFrom?: Date;
		validUntil?: Date;
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			Entity.validateAmount(params.unitAmount);

			const now = new Date();
			const price: Model = {
				id: params.id ?? id(),
				productId: params.productId,
				currency: params.currency,
				unitAmount: params.unitAmount,
				type: params.type ?? Type.REGULAR,
				status: params.status ?? Status.ACTIVE,
				validFrom: params.validFrom,
				validUntil: params.validUntil,
				createdAt: now,
				updatedAt: now,
			};

			return new Entity(price);
		}

		static fromModel(model: Model): Entity {
			return new Entity(model);
		}

		static validateAmount(unitAmount: number): void {
			if (unitAmount <= 0) {
				throw new AppError(
					"Price amount must be greater than zero",
					400,
					ErrorCode.INVALID_PRICE,
				);
			}
		}

		get id(): Id {
			return this.props.id;
		}
		get productId(): Id {
			return this.props.productId;
		}
		get currency(): string {
			return this.props.currency;
		}
		get unitAmount(): number {
			return this.props.unitAmount;
		}
		get type(): Type {
			return this.props.type;
		}
		get status(): Status {
			return this.props.status;
		}
		get validFrom(): Date | undefined {
			return this.props.validFrom;
		}
		get validUntil(): Date | undefined {
			return this.props.validUntil;
		}
		get createdAt(): Date {
			return this.props.createdAt;
		}
		get updatedAt(): Date {
			return this.props.updatedAt;
		}

		updateAmount(unitAmount: number): void {
			Entity.validateAmount(unitAmount);
			this.props.unitAmount = unitAmount;
			this.props.updatedAt = new Date();
		}

		updateType(type: Type): void {
			this.props.type = type;
			this.props.updatedAt = new Date();
		}

		updateStatus(status: Status): void {
			this.props.status = status;
			this.props.updatedAt = new Date();
		}

		updateValidityPeriod(validFrom?: Date, validUntil?: Date): void {
			this.props.validFrom = validFrom;
			this.props.validUntil = validUntil;
			this.props.updatedAt = new Date();
		}

		isExpired(): boolean {
			const now = new Date();
			return !!this.props.validUntil && now > this.props.validUntil;
		}

		isValid(): boolean {
			const now = new Date();
			return (
				this.props.status === Status.ACTIVE &&
				(!this.props.validFrom || now >= this.props.validFrom) &&
				(!this.props.validUntil || now <= this.props.validUntil)
			);
		}

		getSnapshot(): Model {
			return { ...this.props };
		}
	}
}
