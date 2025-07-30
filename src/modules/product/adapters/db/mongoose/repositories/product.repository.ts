import type { FilterQuery } from "mongoose";
import { Product } from "@/src/modules/product/core/domain/entities";
import type {
	ProductFilters,
	ProductRepository,
} from "@/src/modules/product/core/ports/outbound/product-repository";
import { type ProductDocument, ProductModel } from "../models/product.model";

export class MongooseProductRepository implements ProductRepository {
	async create(product: Product.Props): Promise<Product.Props> {
		const doc = await ProductModel.create({
			...product,
			slug: product.slug.toString(),
		});

		return this.toDomainProps(doc.toJSON());
	}

	async update(data: Partial<Product.Props>): Promise<Product.Props> {
		if (!data.id) {
			throw new Error("ID is required for update");
		}

		const doc = await ProductModel.findOneAndUpdate(
			{ id: data.id },
			{
				...data,
				...(data.slug && { slug: data.slug.toString() }),
			},
			{ new: true },
		);

		if (!doc) {
			throw new Error("Product not found");
		}

		return this.toDomainProps(doc.toJSON());
	}

	async delete(id: string): Promise<void> {
		await ProductModel.findOneAndDelete({ id });
	}

	async findById(id: string): Promise<Product.Props | null> {
		const doc = await ProductModel.findOne({ id });
		if (!doc) return null;

		return this.toDomainProps(doc.toJSON());
	}

	async findByOrganizationId(organizationId: string): Promise<Product.Props[]> {
		const docs = await ProductModel.find({ organizationId });
		return docs.map(this.toDomainProps);
	}

	async findBySlug(slug: string): Promise<Product.Props | null> {
		const doc = await ProductModel.findOne({ slug });
		if (!doc) return null;

		return this.toDomainProps(doc.toJSON());
	}

	async findBySku(
		sku: string,
		organizationId: string,
	): Promise<Product.Props | null> {
		const doc = await ProductModel.findOne({ sku, organizationId });
		if (!doc) return null;

		return this.toDomainProps(doc.toJSON());
	}

	async findByBarcode(
		barcode: string,
		organizationId: string,
	): Promise<Product.Props | null> {
		const doc = await ProductModel.findOne({ barcode, organizationId });
		if (!doc) return null;

		return this.toDomainProps(doc.toJSON());
	}

	async findByCategoryId(categoryId: string): Promise<Product.Props[]> {
		const docs = await ProductModel.find({ categoryId });
		return docs.map(this.toDomainProps);
	}

	async findByProductTypeId(productTypeId: string): Promise<Product.Props[]> {
		const docs = await ProductModel.find({ productTypeId });
		return docs.map(this.toDomainProps);
	}

	async findByOrganizationIdAndCategoryId(
		organizationId: string,
		categoryId: string,
	): Promise<Product.Props[]> {
		const docs = await ProductModel.find({ organizationId, categoryId });
		return docs.map(this.toDomainProps);
	}

	async findByOrganizationIdAndProductTypeId(
		organizationId: string,
		productTypeId: string,
	): Promise<Product.Props[]> {
		const docs = await ProductModel.find({ organizationId, productTypeId });
		return docs.map(this.toDomainProps);
	}

	async findManyByIds(ids: string[]): Promise<Product.Props[]> {
		const docs = await ProductModel.find({ id: { $in: ids } });
		return docs.map(this.toDomainProps);
	}

	async findByOrganizationIdWithFilters(
		organizationId: string,
		filters: ProductFilters.Filters,
	): Promise<{ items: Product.Props[]; totalItems: number }> {
		const {
			categoryId,
			productTypeId,
			status,
			search,
			hasSku,
			hasBarcode,
			hasImage,
			createdAfter,
			createdBefore,
			updatedAfter,
			updatedBefore,
			limit = 20,
			page = 1,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = filters;

		const offset = (page - 1) * limit;

		const query: FilterQuery<Product.Props> = { organizationId };

		if (categoryId) {
			query.categoryId = categoryId;
		}
		if (productTypeId) {
			query.productTypeId = productTypeId;
		}
		if (status) {
			query.status = status;
		}

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
			];
		}

		if (hasSku !== undefined) {
			if (hasSku) {
				query.sku = { $exists: true, $ne: null };
				(query as any).$and = query.$and || [];
				(query as any).$and.push({ sku: { $ne: "" } });
			} else {
				query.sku = { $exists: false };
			}
		}
		if (hasBarcode !== undefined) {
			if (hasBarcode) {
				query.barcode = { $exists: true, $ne: null };
				(query as any).$and = query.$and || [];
				(query as any).$and.push({ barcode: { $ne: "" } });
			} else {
				query.barcode = { $exists: false };
			}
		}
		if (hasImage !== undefined) {
			if (hasImage) {
				query.imageUrl = { $exists: true, $ne: null };
				(query as any).$and = query.$and || [];
				(query as any).$and.push({ imageUrl: { $ne: "" } });
			} else {
				query.imageUrl = { $exists: false };
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

		let queryBuilder = ProductModel.find(query).sort(sort);

		if (offset) {
			queryBuilder = queryBuilder.skip(offset);
		}
		if (limit) {
			queryBuilder = queryBuilder.limit(limit);
		}

		const docs = await queryBuilder.exec();

		const totalItems = await ProductModel.countDocuments(query);

		const items = docs.map(this.toDomainProps);

		return {
			items,
			totalItems,
		};
	}

	async findB2CProducts(
		filters: ProductFilters.B2CFilters,
	): Promise<{ items: Product.B2CProduct[]; totalItems: number }> {
		const {
			status,
			organizationId,
			categoryId,
			productTypeId,
			search,
			minPrice,
			maxPrice,
			currency,
			limit = 20,
			page = 1,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = filters;

		const offset = (page - 1) * limit;

		const query: FilterQuery<Product.Props> = {};

		query.status = status || Product.Status.ACTIVE;

		if (organizationId) {
			query.organizationId = organizationId;
		}
		if (categoryId) {
			query.categoryId = categoryId;
		}
		if (productTypeId) {
			query.productTypeId = productTypeId;
		}

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
			];
		}

		const pipeline: any[] = [
			{ $match: query },
			{
				$lookup: {
					from: "prices",
					localField: "id",
					foreignField: "productId",
					as: "prices",
				},
			},
			{
				$lookup: {
					from: "productcategories",
					localField: "categoryId",
					foreignField: "id",
					as: "category",
				},
			},
			{
				$lookup: {
					from: "producttypes",
					localField: "productTypeId",
					foreignField: "id",
					as: "productType",
				},
			},
			{
				$lookup: {
					from: "organizations",
					localField: "organizationId",
					foreignField: "id",
					as: "organization",
				},
			},
		];

		if (minPrice !== undefined || maxPrice !== undefined || currency) {
			const priceConditions: any[] = [{ status: "active" }];

			if (currency) {
				priceConditions.push({ currency });
			}

			if (minPrice !== undefined || maxPrice !== undefined) {
				const amountCondition: any = {};
				if (minPrice !== undefined) {
					amountCondition.$gte = minPrice;
				}
				if (maxPrice !== undefined) {
					amountCondition.$lte = maxPrice;
				}
				priceConditions.push({ unitAmount: amountCondition });
			}

			pipeline.push({
				$match: {
					$expr: {
						$gt: [
							{
								$size: {
									$filter: {
										input: "$prices",
										cond: { $and: priceConditions },
									},
								},
							},
							0,
						],
					},
				},
			});
		}

		let sortStage: any = {};
		if (sortBy === "price") {
			sortStage = {
				$sort: {
					"prices.unitAmount": sortOrder === "asc" ? 1 : -1,
				},
			};
		} else {
			sortStage = {
				$sort: {
					[sortBy]: sortOrder === "asc" ? 1 : -1,
				},
			};
		}
		pipeline.push(sortStage);

		if (offset) {
			pipeline.push({ $skip: offset });
		}
		if (limit) {
			pipeline.push({ $limit: limit });
		}

		const docs = await ProductModel.aggregate(pipeline);
		const totalItems = await ProductModel.countDocuments(query);

		const items = docs.map((doc) => this.toB2CProduct(doc));

		return {
			items,
			totalItems,
		};
	}

	private toDomainProps(doc: ProductDocument): Product.Props {
		return {
			id: doc.id,
			name: doc.name,
			slug: doc.slug,
			description: doc.description,
			categoryId: doc.categoryId,
			productTypeId: doc.productTypeId,
			status: doc.status as Product.Status,
			organizationId: doc.organizationId,
			createdById: doc.createdById,
			imageUrl: doc.imageUrl,
			default_price_id: doc.default_price_id,
			default_price: doc.default_price,
			sku: doc.sku,
			barcode: doc.barcode,
			weight: doc.weight,
			dimensions: doc.dimensions,
			meta: doc.meta,
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt,
		};
	}

	private toB2CProduct(doc: any): Product.B2CProduct {
		const category = doc.category?.[0] || {};
		const productType = doc.productType?.[0] || {};
		const organization = doc.organization?.[0] || {};

		const prices = doc.prices || [];
		const activePrice =
			prices.find((p: any) => p.status === "active") || prices[0];

		return {
			slug: doc.slug,
			name: doc.name,
			description: doc.description,
			imageUrl: doc.imageUrl,
			weight: doc.weight,
			dimensions: doc.dimensions,
			store: {
				slug: organization.slug || "",
				name: organization.name || "",
				logoUrl: organization.logoUrl,
				createdAt: organization.createdAt || new Date(),
			},
			category: {
				slug: category.slug || "",
				name: category.name || "",
			},
			productType: {
				slug: productType.slug || "",
				name: productType.name || "",
			},
			price: activePrice || null,
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt,
		};
	}
}
