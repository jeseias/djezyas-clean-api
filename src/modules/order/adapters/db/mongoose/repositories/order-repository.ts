import type { FilterQuery } from "mongoose";
import type { Order } from "@/src/modules/order/domain/entities";
import type {
	OrderFilters,
	OrderRepository,
} from "@/src/modules/order/domain/repositories/order-repository";
import { type OrderDocument, OrderModel } from "../models/order-model";

export class MongooseOrderRepository implements OrderRepository {
	private getLookupPipeline() {
		return [
			// Unwind items first to work with each item individually
			{
				$unwind: {
					path: "$items",
					preserveNullAndEmptyArrays: true,
				},
			},
			// Lookup products for each item
			{
				$lookup: {
					from: "products",
					localField: "items.productId",
					foreignField: "id",
					as: "items.product",
				},
			},
			// Lookup for organization
			{
				$lookup: {
					from: "organizations",
					localField: "organizationId",
					foreignField: "id",
					as: "organization",
				},
			},
			// Lookup prices for each item
			{
				$lookup: {
					from: "prices",
					localField: "items.priceId",
					foreignField: "id",
					as: "items.price",
				},
			},
			// Get the first (and only) product and price for each item
			{
				$addFields: {
					"items.product": { $arrayElemAt: ["$items.product", 0] },
					"items.price": { $arrayElemAt: ["$items.price", 0] },
					organization: { $arrayElemAt: ["$organization", 0] },
				},
			},
			// Group back by order, preserving all item fields
			{
				$group: {
					_id: "$_id",
					id: { $first: "$id" },
					code: { $first: "$code" },
					userId: { $first: "$userId" },
					organizationId: { $first: "$organizationId" },
					organization: { $first: "$organization" },
					items: {
						$push: {
							productId: "$items.productId",
							priceId: "$items.priceId",
							name: "$items.name",
							quantity: "$items.quantity",
							unitAmount: "$items.unitAmount",
							subtotal: "$items.subtotal",
							product: "$items.product",
							price: "$items.price",
						},
					},
					totalAmount: { $first: "$totalAmount" },
					paymentStatus: { $first: "$paymentStatus" },
					fulfillmentStatus: { $first: "$fulfillmentStatus" },
					clientConfirmedIsDelivered: { $first: "$clientConfirmedIsDelivered" },
					paymentIntentId: { $first: "$paymentIntentId" },
					transactionId: { $first: "$transactionId" },
					paidAt: { $first: "$paidAt" },
					inDeliveryAt: { $first: "$inDeliveryAt" },
					clientConfirmedDeliveryAt: { $first: "$clientConfirmedDeliveryAt" },
					expiredAt: { $first: "$expiredAt" },
					cancelledAt: { $first: "$cancelledAt" },
					meta: { $first: "$meta" },
					createdAt: { $first: "$createdAt" },
					updatedAt: { $first: "$updatedAt" },
				},
			},
		];
	}

	private mapToDomainModel(doc: OrderDocument): Order.Model {
		return {
			id: doc.id,
			code: doc.code,
			userId: doc.userId,
			organizationId: doc.organizationId,
			organization: doc.organization as any,
			items: doc.items.map((item) => ({
				productId: item.productId,
				priceId: item.priceId,
				name: item.name,
				quantity: item.quantity,
				unitAmount: item.unitAmount,
				subtotal: item.subtotal,
				product: (item as any).product || null,
				price: (item as any).price || null,
			})),
			totalAmount: doc.totalAmount,
			paymentStatus: doc.paymentStatus,
			fulfillmentStatus: doc.fulfillmentStatus,
			clientConfirmedIsDelivered: doc.clientConfirmedIsDelivered,
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
			code: order.code,
			userId: order.userId,
			organizationId: order.organizationId,
			items: order.items.map((item) => ({
				productId: item.productId,
				priceId: item.priceId,
				name: item.name,
				quantity: item.quantity,
				unitAmount: item.unitAmount,
				subtotal: item.subtotal,
			})),
			totalAmount: order.totalAmount,
			paymentStatus: order.paymentStatus,
			fulfillmentStatus: order.fulfillmentStatus,
			clientConfirmedIsDelivered: order.clientConfirmedIsDelivered,
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
			{ new: true },
		);

		if (!doc) {
			throw new Error("Order not found");
		}

		return this.mapToDomainModel(doc);
	}

	async delete(id: string): Promise<void> {
		await OrderModel.findOneAndDelete({ id });
	}

	async findById(id: string): Promise<Order.Model | null> {
		const [doc] = await OrderModel.aggregate([
			{ $match: { id } },
			...this.getLookupPipeline(),
		]);
		if (!doc) return null;

		return this.mapToDomainModel(doc as OrderDocument);
	}

	async findManyByIds(ids: string[]): Promise<Order.Model[]> {
		const docs = await OrderModel.aggregate([
			{ $match: { id: { $in: ids } } },
			...this.getLookupPipeline(),
		]);
		return docs.map((doc) => this.mapToDomainModel(doc as OrderDocument));
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

		// Build aggregation pipeline with lookups
		const pipeline: any[] = [
			{ $match: query },
			...this.getLookupPipeline(),
			{ $sort: sort },
		];

		if (offset) {
			pipeline.push({ $skip: offset });
		}
		if (limit) {
			pipeline.push({ $limit: limit });
		}

		const docs = await OrderModel.aggregate(pipeline);
		const totalItems = await OrderModel.countDocuments(query);

		const items = docs.map((doc) =>
			this.mapToDomainModel(doc as OrderDocument),
		);

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

		// Build aggregation pipeline with lookups
		const pipeline: any[] = [
			{ $match: query },
			...this.getLookupPipeline(),
			{ $sort: sort },
		];

		if (offset) {
			pipeline.push({ $skip: offset });
		}
		if (limit) {
			pipeline.push({ $limit: limit });
		}

		const docs = await OrderModel.aggregate(pipeline);
		const totalItems = await OrderModel.countDocuments(query);

		const items = docs.map((doc) =>
			this.mapToDomainModel(doc as OrderDocument),
		);

		return {
			items,
			totalItems,
		};
	}

	async findAllByTransactionId(transactionId: string): Promise<Order.Model[]> {
		const docs = await OrderModel.aggregate([
			{ $match: { transactionId } },
			...this.getLookupPipeline(),
		]);
		return docs.map((doc) => this.mapToDomainModel(doc as OrderDocument));
	}
}
