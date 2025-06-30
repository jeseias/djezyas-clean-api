import { type Id, id } from "@/src/modules/shared/value-objects";

export namespace Currency {
	export enum Status {
		ACTIVE = "active",
		INACTIVE = "inactive",
	}

	export type Model = {
		id: Id;
		code: string;
		name: string;
		symbol: string;
		status: Status;
		exchangeRate?: number;
		createdAt: Date;
		updatedAt: Date;
	};

	export type CreateParams = {
		code: string;
		name: string;
		symbol: string;
		status?: Status;
		exchangeRate?: number;
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			const now = new Date();
			const currency: Model = {
				id: id(),
				code: params.code.toUpperCase(),
				name: params.name,
				symbol: params.symbol,
				status: params.status ?? Status.ACTIVE,
				exchangeRate: params.exchangeRate,
				createdAt: now,
				updatedAt: now,
			};
			return new Entity(currency);
		}

		static fromModel(model: Model): Entity {
			return new Entity(model);
		}

		get id(): Id {
			return this.props.id;
		}
		get code(): string {
			return this.props.code;
		}
		get name(): string {
			return this.props.name;
		}
		get symbol(): string {
			return this.props.symbol;
		}
		get status(): Status {
			return this.props.status;
		}
		get exchangeRate(): number | undefined {
			return this.props.exchangeRate;
		}
		get createdAt(): Date {
			return this.props.createdAt;
		}
		get updatedAt(): Date {
			return this.props.updatedAt;
		}

		updateName(name: string): void {
			this.props.name = name;
			this.props.updatedAt = new Date();
		}

		updateSymbol(symbol: string): void {
			this.props.symbol = symbol;
			this.props.updatedAt = new Date();
		}

		updateStatus(status: Status): void {
			this.props.status = status;
			this.props.updatedAt = new Date();
		}

		updateExchangeRate(exchangeRate: number): void {
			this.props.exchangeRate = exchangeRate;
			this.props.updatedAt = new Date();
		}

		toJSON(): Model {
			return { ...this.props };
		}
	}
}
