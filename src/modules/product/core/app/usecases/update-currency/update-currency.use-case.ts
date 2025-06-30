import { AppError } from "@/src/modules/shared/errors";
import { Currency } from "../../../domain/entities";
import type { CurrencyRepository } from "../../../ports/outbound/currency-repository";

export namespace UpdateCurrency {
	export type Params = {
		currencyId: string;
		name?: string;
		symbol?: string;
		status?: Currency.Status;
		exchangeRate?: number;
	};

	export type Result = Currency.Model;
}

export class UpdateCurrencyUseCase {
	constructor(private readonly currencyRepository: CurrencyRepository) {}

	async execute(params: UpdateCurrency.Params): Promise<UpdateCurrency.Result> {
		// Validate currency exists
		const currencyModel = await this.currencyRepository.findById(
			params.currencyId,
		);
		if (!currencyModel) {
			throw new AppError("Currency not found", 404);
		}
		const currency = Currency.Entity.fromModel(currencyModel);

		// Update currency properties
		if (params.name !== undefined) {
			currency.updateName(params.name);
		}

		if (params.symbol !== undefined) {
			currency.updateSymbol(params.symbol);
		}

		if (params.status !== undefined) {
			currency.updateStatus(params.status);
		}

		if (params.exchangeRate !== undefined) {
			if (params.exchangeRate < 0) {
				throw new AppError("Exchange rate must be positive", 400);
			}
			currency.updateExchangeRate(params.exchangeRate);
		}

		// Save updated currency
		await this.currencyRepository.update(currency.toJSON());

		return currency.toJSON();
	}
}
