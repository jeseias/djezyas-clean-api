import type { Price } from "@/src/modules/product/core/domain/entities";
import type { PriceRepository } from "@/src/modules/product/core/ports/outbound/price-repository";
import { PriceModel } from "../price-model";

export class MongoosePriceRepository implements PriceRepository {
	async create(price: Price.Model): Promise<Price.Model> {
		const doc = await PriceModel.create(price);
		const json = doc.toJSON();
		return {
			...json,
			type: json.type as Price.Type,
			status: json.status as Price.Status,
		};
	}

	async update(data: Partial<Price.Model>): Promise<Price.Model> {
		if (!data.id) {
			throw new Error("ID is required for update");
		}

		const doc = await PriceModel.findOneAndUpdate({ id: data.id }, data, {
			new: true,
		});

		if (!doc) {
			throw new Error("Price not found");
		}

		const json = doc.toJSON();
		return {
			...json,
			type: json.type as Price.Type,
			status: json.status as Price.Status,
		};
	}

	async delete(id: string): Promise<void> {
		await PriceModel.findOneAndDelete({ id });
	}

	async findById(id: string): Promise<Price.Model | null> {
		const doc = await PriceModel.findOne({ id });
		if (!doc) return null;

		const json = doc.toJSON();
		return {
			...json,
			type: json.type as Price.Type,
			status: json.status as Price.Status,
		};
	}

	async findByProductId(productId: string): Promise<Price.Model[]> {
		const docs = await PriceModel.find({ productId });
		return docs.map((doc) => {
			const json = doc.toJSON();
			return {
				...json,
				type: json.type as Price.Type,
				status: json.status as Price.Status,
			};
		});
	}

	async findByProductIdAndCurrencyId(
		productId: string,
		currencyId: string,
	): Promise<Price.Model[]> {
		const docs = await PriceModel.find({ productId, currencyId });
		return docs.map((doc) => {
			const json = doc.toJSON();
			return {
				...json,
				type: json.type as Price.Type,
				status: json.status as Price.Status,
			};
		});
	}
}
