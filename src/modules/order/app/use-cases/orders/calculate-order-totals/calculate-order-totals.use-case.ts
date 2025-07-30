import { AppError, ErrorCode } from "@/src/modules/shared/errors";

export namespace CalculateOrderTotals {
	export type Params = {
		items: {
			productId: string;
			unitAmount: number;
			quantity: number;
		}[];
	};

	export type Result = {
		subtotal: number;
		platformFee: number;
		providerFee: number;
		total: number;
		breakdownPerItem: {
			productId: string;
			quantity: number;
			unitAmount: number;
			subtotal: number;
		}[];
	};
}

export class CalculateOrderTotalsUseCase {
	constructor(
		private readonly platformFeePercentage = 0.1,
		private readonly providerFeePercentage = 0.05,
	) {}

	private round(value: number): number {
		return Math.round(value * 100) / 100;
	}

	async execute(
		params: CalculateOrderTotals.Params,
	): Promise<CalculateOrderTotals.Result> {
		if (!params.items || params.items.length === 0) {
			throw new AppError(
				"Items array cannot be empty",
				400,
				ErrorCode.INVALID_OPERATION,
			);
		}

		for (const item of params.items) {
			if (!item.productId) {
				throw new AppError(
					"Product ID is required for all items",
					400,
					ErrorCode.INVALID_OPERATION,
				);
			}

			if (item.unitAmount <= 0) {
				throw new AppError(
					`Unit amount must be greater than 0 for product: ${item.productId}`,
					400,
					ErrorCode.INVALID_OPERATION,
				);
			}

			if (item.quantity <= 0) {
				throw new AppError(
					`Quantity must be greater than 0 for product: ${item.productId}`,
					400,
					ErrorCode.INVALID_OPERATION,
				);
			}
		}

		const breakdownPerItem: CalculateOrderTotals.Result["breakdownPerItem"] =
			params.items.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				unitAmount: item.unitAmount,
				subtotal: this.round(item.unitAmount * item.quantity),
			}));

		const subtotal = this.round(
			breakdownPerItem.reduce((sum, item) => sum + item.subtotal, 0),
		);

		const platformFee = this.round(subtotal * this.platformFeePercentage);
		const providerFee = this.round(subtotal * this.providerFeePercentage);

		const total = this.round(subtotal + platformFee + providerFee);

		return {
			subtotal,
			platformFee,
			providerFee,
			total,
			breakdownPerItem,
		};
	}
}
