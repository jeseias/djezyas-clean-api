import type { FilterQuery } from "mongoose";
import type { Order } from "@/src/modules/order/domain/entities";
import type {
	OrderFilters,
	OrderRepository,
} from "@/src/modules/order/domain/repositories/order-repository";
import { OrderModel, type OrderDocument } from "../models/order-model";

export class MongooseOrderRepository implements OrderRepository {
	private getPopulateOptions() {
		return [
			{
				path: "items.product",
				model: "Product",
				select: "id name slug description imageUrl sku barcode weight dimensions default_price_id status organizationId createdById meta createdAt updatedAt",
			},
			{
				path: "items.price",
				model: "Price",
				select: "id productId currency unitAmount type status validFrom validUntil createdAt updatedAt",
			},
		];
	}

	private mapToDomainModel(doc: OrderDocument): Order.Model {
		return {
			id: doc.id,
			userId: doc.userId,
			organizationId: doc.organizationId,
			items: doc.items.map((item) => ({
				productId: item.productId,
				priceId: item.priceId,
				name: item.name,
				quantity: item.quantity,
				unitAmount: item.unitAmount,
				subtotal: item.subtotal,
				product: item.product || ({} as any),
				price: item.price || ({} as any),
			})),
			totalAmount: doc.totalAmount,
			status: doc.status,
			paymentIntentId: doc.paymentIntentId,
			transactionId: doc.transactionId,
			paidAt: doc.paidAt,
			inDeliveryAt: doc.inDeliveryAt,
			clientConfirmedDeliveryAt: doc.clientConfirmedDeliveryAt,
			expiredAt: doc.expiredAt,
			cancelledAt: doc.cancelledAt,
			meta: doc.meta,
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt,
		};
	}

	private mapToDocumentModel(order: Order.Model): Partial<OrderDocument> {
		return {
			id: order.id,
			userId: order.userId,
			organizationId: order.organizationId,
			items: order.items.map((item) => ({
				productId: item.productId,
				priceId: item.priceId,
				name: item.name,
				quantity: item.quantity,
				unitAmount: item.unitAmount,
				subtotal: item.subtotal,
				product: item.product,
				price: item.price,
			})),
			totalAmount: order.totalAmount,
			status: order.status,
			paymentIntentId: order.paymentIntentId,
			transactionId: order.transactionId,
			paidAt: order.paidAt,
			inDeliveryAt: order.inDeliveryAt,
			clientConfirmedDeliveryAt: order.clientConfirmedDeliveryAt,
			expiredAt: order.expiredAt,
			cancelledAt: order.cancelledAt,
			meta: order.meta,
		};
	}

	async create(order: Order.Model): Promise<Order.Model> {
		const doc = await OrderModel.create(this.mapToDocumentModel(order));
		return this.mapToDomainModel(doc);
	}

	async update(data: Partial<Order.Model>): Promise<Order.Model> {
		if (!data.id) {
			throw new Error("ID is required for update");
		}

		const doc = await OrderModel.findOneAndUpdate(
			{ id: data.id },
			this.mapToDocumentModel(data as Order.Model),
			{ new: true }
		).populate(this.getPopulateOptions());

		if (!doc) {
			throw new Error("Order not found");
		}

		return this.mapToDomainModel(doc);
	}

	async delete(id: string): Promise<void> {
		await OrderModel.findOneAndDelete({ id });
	}

	async findById(id: string): Promise<Order.Model | null> {
		const doc = await OrderModel.findOne({ id }).populate(this.getPopulateOptions());
		if (!doc) return null;

		return this.mapToDomainModel(doc);
	}

	async findManyByIds(ids: string[]): Promise<Order.Model[]> {
		const docs = await OrderModel.find({ id: { $in: ids } }).populate(this.getPopulateOptions());
		return docs.map((doc) => this.mapToDomainModel(doc));
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

		const query: FilterQuery<OrderDocument> = { userId };

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

		let queryBuilder = OrderModel.find(query).populate(this.getPopulateOptions()).sort(sort);

		if (offset) {
			queryBuilder = queryBuilder.skip(offset);
		}
		if (limit) {
			queryBuilder = queryBuilder.limit(limit);
		}

		const docs = await queryBuilder.exec();
		const totalItems = await OrderModel.countDocuments(query);

		const items = docs.map((doc) => this.mapToDomainModel(doc));

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

		const query: FilterQuery<OrderDocument> = {
			organizationId: organizationId,
		};

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

		let queryBuilder = OrderModel.find(query).populate(this.getPopulateOptions()).sort(sort);

		if (offset) {
			queryBuilder = queryBuilder.skip(offset);
		}
		if (limit) {
			queryBuilder = queryBuilder.limit(limit);
		}

		const docs = await queryBuilder.exec();
		const totalItems = await OrderModel.countDocuments(query);

		const items = docs.map((doc) => this.mapToDomainModel(doc));

		return {
			items,
			totalItems,
		};
	}

	async findAllByTransactionId(transactionId: string): Promise<Order.Model[]> {
		const docs = await OrderModel.find({ transactionId }).populate(this.getPopulateOptions());
		return docs.map((doc) => this.mapToDomainModel(doc));
	}
}
