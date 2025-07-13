import type { FilterQuery } from "mongoose";
import type { Product } from "@/src/modules/product/core/domain/entities";
import type {
	ProductFilters,
	ProductRepository,
} from "@/src/modules/product/core/ports/outbound/product-repository";
import { Slug } from "@/src/modules/shared/value-objects";
import { ProductModel } from "../product-model";

export class MongooseProductRepository implements ProductRepository {
	async create(product: Product.Model): Promise<Product.Model> {
		const doc = await ProductModel.create({
			...product,
			slug: product.slug.toString(),
		});

		const json = doc.toJSON();
		return {
			...json,
			slug: Slug.fromValue(doc.slug),
			status: json.status as Product.Status,
		};
	}

	async update(data: Partial<Product.Model>): Promise<Product.Model> {
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

		const json = doc.toJSON();
		return {
			...json,
			slug: Slug.fromValue(doc.slug),
			status: json.status as Product.Status,
		};
	}

	async delete(id: string): Promise<void> {
		await ProductModel.findOneAndDelete({ id });
	}

	async findById(id: string): Promise<Product.Model | null> {
		const doc = await ProductModel.findOne({ id });
		if (!doc) return null;

		const json = doc.toJSON();
		return {
			...json,
			slug: Slug.fromValue(doc.slug),
			status: json.status as Product.Status,
		};
	}

	async findByOrganizationId(organizationId: string): Promise<Product.Model[]> {
		const docs = await ProductModel.find({ organizationId });
		return docs.map((doc) => {
			const json = doc.toJSON();
			return {
				...json,
				slug: Slug.fromValue(doc.slug),
				status: json.status as Product.Status,
			};
		});
	}

	async findBySlug(slug: string): Promise<Product.Model | null> {
		const doc = await ProductModel.findOne({ slug });
		if (!doc) return null;

		const json = doc.toJSON();
		return {
			...json,
			slug: Slug.fromValue(doc.slug),
			status: json.status as Product.Status,
		};
	}

	async findBySku(
		sku: string,
		organizationId: string,
	): Promise<Product.Model | null> {
		const doc = await ProductModel.findOne({ sku, organizationId });
		if (!doc) return null;

		const json = doc.toJSON();
		return {
			...json,
			slug: Slug.fromValue(doc.slug),
			status: json.status as Product.Status,
		};
	}

	async findByBarcode(
		barcode: string,
		organizationId: string,
	): Promise<Product.Model | null> {
		const doc = await ProductModel.findOne({ barcode, organizationId });
		if (!doc) return null;

		const json = doc.toJSON();
		return {
			...json,
			slug: Slug.fromValue(doc.slug),
			status: json.status as Product.Status,
		};
	}

	async findByCategoryId(categoryId: string): Promise<Product.Model[]> {
		const docs = await ProductModel.find({ categoryId });
		return docs.map((doc) => {
			const json = doc.toJSON();
			return {
				...json,
				slug: Slug.fromValue(doc.slug),
				status: json.status as Product.Status,
			};
		});
	}

	async findByProductTypeId(productTypeId: string): Promise<Product.Model[]> {
		const docs = await ProductModel.find({ productTypeId });
		return docs.map((doc) => {
			const json = doc.toJSON();
			return {
				...json,
				slug: Slug.fromValue(doc.slug),
				status: json.status as Product.Status,
			};
		});
	}

	async findByOrganizationIdAndCategoryId(
		organizationId: string,
		categoryId: string,
	): Promise<Product.Model[]> {
		const docs = await ProductModel.find({ organizationId, categoryId });
		return docs.map((doc) => {
			const json = doc.toJSON();
			return {
				...json,
				slug: Slug.fromValue(doc.slug),
				status: json.status as Product.Status,
			};
		});
	}

	async findByOrganizationIdAndProductTypeId(
		organizationId: string,
		productTypeId: string,
	): Promise<Product.Model[]> {
		const docs = await ProductModel.find({ organizationId, productTypeId });
		return docs.map((doc) => {
			const json = doc.toJSON();
			return {
				...json,
				slug: Slug.fromValue(doc.slug),
				status: json.status as Product.Status,
			};
		});
	}

	async findByOrganizationIdWithFilters(
		organizationId: string,
		filters: ProductFilters.Filters,
	): Promise<{ items: Product.Model[]; totalItems: number }> {
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
			limit,
			offset,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = filters;

		const query: FilterQuery<Product.Model> = { organizationId };

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

		const items = docs.map((doc) => {
			const json = doc.toJSON();
			return {
				...json,
				slug: Slug.fromValue(doc.slug),
				status: json.status as Product.Status,
			};
		});

		return {
			items,
			totalItems,
		};
	}
}
