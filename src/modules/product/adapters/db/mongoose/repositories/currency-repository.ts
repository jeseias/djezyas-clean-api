import { Currency } from "@/src/modules/product/core/domain/entities";
import type { CurrencyRepository } from "@/src/modules/product/core/ports/outbound/currency-repository";
import { CurrencyModel } from "../currency-model";

export class MongooseCurrencyRepository implements CurrencyRepository {
	async create(currency: Currency.Model): Promise<Currency.Model> {
		const doc = await CurrencyModel.create(currency);
		return doc.toJSON();
	}

	async update(data: Partial<Currency.Model>): Promise<Currency.Model> {
		if (!data.id) {
			throw new Error("ID is required for update");
		}

		const doc = await CurrencyModel.findOneAndUpdate({ id: data.id }, data, {
			new: true,
		});

		if (!doc) {
			throw new Error("Currency not found");
		}

		return doc.toJSON();
	}

	async delete(id: string): Promise<void> {
		await CurrencyModel.findOneAndDelete({ id });
	}

	async findById(id: string): Promise<Currency.Model | null> {
		const doc = await CurrencyModel.findOne({ id });
		if (!doc) return null;

		return doc.toJSON();
	}

	async findByCode(code: string): Promise<Currency.Model | null> {
		const doc = await CurrencyModel.findOne({ code: code.toUpperCase() });
		if (!doc) return null;

		return doc.toJSON();
	}

	async findActive(): Promise<Currency.Model[]> {
		const docs = await CurrencyModel.find({ status: Currency.Status.ACTIVE });
		return docs.map((doc) => doc.toJSON());
	}

	async findByStatus(status: Currency.Status): Promise<Currency.Model[]> {
		const docs = await CurrencyModel.find({ status });
		return docs.map((doc) => doc.toJSON());
	}
}
