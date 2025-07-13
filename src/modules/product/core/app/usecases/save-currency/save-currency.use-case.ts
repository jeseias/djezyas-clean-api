import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { Currency } from "../../../domain/entities";
import type { CurrencyRepository } from "../../../ports/outbound/currency-repository";

export namespace SaveCurrency {
	export type Params = {
		id?: string;
		code?: string;
		name?: string;
		symbol?: string;
		status?: Currency.Status;
		exchangeRate?: number;
	};

	export type Result = Currency.Model;
}

export class SaveCurrencyUseCase {
	constructor(private readonly currencyRepository: CurrencyRepository) {}

	async execute(params: SaveCurrency.Params): Promise<SaveCurrency.Result> {
		const isUpdate = !!params.id;

		if (isUpdate) {
			return this.updateExistingCurrency(
				params as SaveCurrency.Params & { currencyId: string },
			);
		} else {
			return this.createNewCurrency(params);
		}
	}

	private async updateExistingCurrency(
		params: SaveCurrency.Params & { currencyId: string },
	): Promise<SaveCurrency.Result> {
		const currencyModel = await this.currencyRepository.findById(
			params.currencyId,
		);
		if (!currencyModel) {
			throw new AppError("Currency not found", 404, ErrorCode.ENTITY_NOT_FOUND);
		}
		const currency = Currency.Entity.fromModel(currencyModel);

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
				throw new AppError(
					"Exchange rate must be positive",
					400,
					ErrorCode.INVALID_EXCHANGE_RATE,
				);
			}
			currency.updateExchangeRate(params.exchangeRate);
		}

		await this.currencyRepository.update(currency.toJSON());

		return currency.toJSON();
	}

	private async createNewCurrency(
		params: SaveCurrency.Params,
	): Promise<SaveCurrency.Result> {
		if (!params.code) {
			throw new AppError(
				"Currency code is required",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}
		if (!params.name) {
			throw new AppError(
				"Currency name is required",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}
		if (!params.symbol) {
			throw new AppError(
				"Currency symbol is required",
				400,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		const existingCurrency = await this.currencyRepository.findByCode(
			params.code,
		);
		if (existingCurrency) {
			throw new AppError(
				"Currency with this code already exists",
				400,
				ErrorCode.CURRENCY_UPDATE_ERROR,
			);
		}

		if (params.exchangeRate !== undefined && params.exchangeRate < 0) {
			throw new AppError(
				"Exchange rate must be positive",
				400,
				ErrorCode.INVALID_EXCHANGE_RATE,
			);
		}

		const currency = Currency.Entity.create({
			code: params.code,
			name: params.name,
			symbol: params.symbol,
			status: params.status,
			exchangeRate: params.exchangeRate,
		});

		await this.currencyRepository.create(currency.toJSON());

		return currency.toJSON();
	}
}
