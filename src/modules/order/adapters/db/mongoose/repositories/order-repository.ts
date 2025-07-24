import type { FilterQuery } from "mongoose";
import type { Order } from "@/src/modules/order/domain/entities";
import type {
	OrderFilters,
	OrderRepository,
} from "@/src/modules/order/domain/repositories/order-repository";
import { OrderModel } from "../models/order-model";

export class MongooseOrderRepository implements OrderRepository {
	async create(order: Order.Model): Promise<Order.Model> {
		const doc = await OrderModel.create(order);
		return doc.toJSON();
	}

	async update(data: Partial<Order.Model>): Promise<Order.Model> {
		if (!data.id) {
			throw new Error("ID is required for update");
		}

		const doc = await OrderModel.findOneAndUpdate({ id: data.id }, data, {
			new: true,
		});

		if (!doc) {
			throw new Error("Order not found");
		}

		return doc.toJSON();
	}

	async delete(id: string): Promise<void> {
		await OrderModel.findOneAndDelete({ id });
	}

	async findById(id: string): Promise<Order.Model | null> {
		const doc = await OrderModel.findOne({ id });
		if (!doc) return null;

		return doc.toJSON();
	}

	async findAllByUserId(
		userId: string,
		filters: OrderFilters.Filters,
	): Promise<{ items: Order.Model[]; totalItems: number }> {
		const {
			status,
			search,
			minAmount,
			maxAmount,
			hasItems,
			createdAfter,
			createdBefore,
			updatedAfter,
			updatedBefore,
			limit,
			offset,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = filters;

		const query: FilterQuery<Order.Model> = { userId };

		if (status) {
			query.status = status;
		}

		if (search) {
			query.$or = [{ "items.name": { $regex: search, $options: "i" } }];
		}

		if (minAmount !== undefined || maxAmount !== undefined) {
			const amountFilter: any = {};
			if (minAmount !== undefined) {
				amountFilter.$gte = minAmount;
			}
			if (maxAmount !== undefined) {
				amountFilter.$lte = maxAmount;
			}
			query.totalAmount = amountFilter;
		}

		if (hasItems !== undefined) {
			if (hasItems) {
				query.items = { $exists: true, $ne: [] };
			} else {
				query.items = { $exists: false };
			}
		}

		if (createdAfter || createdBefore) {
			const createdAtFilter: any = {};
			if (createdAfter) {
				createdAtFilter.$gte = createdAfter;
			}
			if (createdBefore) {
				createdAtFilter.$lte = createdBefore;
			}
			query.createdAt = createdAtFilter;
		}

		if (updatedAfter || updatedBefore) {
			const updatedAtFilter: any = {};
			if (updatedAfter) {
				updatedAtFilter.$gte = updatedAfter;
			}
			if (updatedBefore) {
				updatedAtFilter.$lte = updatedBefore;
			}
			query.updatedAt = updatedAtFilter;
		}

		const sort: Record<string, 1 | -1> = {};
		sort[sortBy] = sortOrder === "asc" ? 1 : -1;

		let queryBuilder = OrderModel.find(query).sort(sort);

		if (offset) {
			queryBuilder = queryBuilder.skip(offset);
		}
		if (limit) {
			queryBuilder = queryBuilder.limit(limit);
		}

		const docs = await queryBuilder.exec();
		const totalItems = await OrderModel.countDocuments(query);

		const items = docs.map((doc) => doc.toJSON());

		return {
			items,
			totalItems,
		};
	}

	async findAllByOrganizationId(
		organizationId: string,
		filters: OrderFilters.Filters,
	): Promise<{ items: Order.Model[]; totalItems: number }> {
		const {
			status,
			search,
			minAmount,
			maxAmount,
			hasItems,
			createdAfter,
			createdBefore,
			updatedAfter,
			updatedBefore,
			limit,
			offset,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = filters;

		const query: FilterQuery<Order.Model> = { organizationId };

		if (status) {
			query.status = status;
		}

		if (search) {
			query.$or = [{ "items.name": { $regex: search, $options: "i" } }];
		}

		if (minAmount !== undefined || maxAmount !== undefined) {
			const amountFilter: any = {};
			if (minAmount !== undefined) {
				amountFilter.$gte = minAmount;
			}
			if (maxAmount !== undefined) {
				amountFilter.$lte = maxAmount;
			}
			query.totalAmount = amountFilter;
		}

		if (hasItems !== undefined) {
			if (hasItems) {
				query.items = { $exists: true, $ne: [] };
			} else {
				query.items = { $exists: false };
			}
		}

		if (createdAfter || createdBefore) {
			const createdAtFilter: any = {};
			if (createdAfter) {
				createdAtFilter.$gte = createdAfter;
			}
			if (createdBefore) {
				createdAtFilter.$lte = createdBefore;
			}
			query.createdAt = createdAtFilter;
		}

		if (updatedAfter || updatedBefore) {
			const updatedAtFilter: any = {};
			if (updatedAfter) {
				updatedAtFilter.$gte = updatedAfter;
			}
			if (updatedBefore) {
				updatedAtFilter.$lte = updatedBefore;
			}
			query.updatedAt = updatedAtFilter;
		}

		const sort: Record<string, 1 | -1> = {};
		sort[sortBy] = sortOrder === "asc" ? 1 : -1;

		let queryBuilder = OrderModel.find(query).sort(sort);

		if (offset) {
			queryBuilder = queryBuilder.skip(offset);
		}
		if (limit) {
			queryBuilder = queryBuilder.limit(limit);
		}

		const docs = await queryBuilder.exec();
		const totalItems = await OrderModel.countDocuments(query);

		const items = docs.map((doc) => doc.toJSON());

		return {
			items,
			totalItems,
		};
	}
}
