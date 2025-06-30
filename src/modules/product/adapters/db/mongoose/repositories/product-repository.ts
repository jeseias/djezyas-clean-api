import type { Product } from "@/src/modules/product/core/domain/entities";
import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import { Slug } from "@/src/modules/shared/value-objects";
import { ProductModel } from "../product-model";

export class MongooseProductRepository implements ProductRepository {
	async create(product: Product.Model): Promise<Product.Model> {
		const doc = await ProductModel.create({
			...product,
			slug: product.slug.toString(),
		});

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
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

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async delete(id: string): Promise<void> {
		await ProductModel.findOneAndDelete({ id });
	}

	async findById(id: string): Promise<Product.Model | null> {
		const doc = await ProductModel.findOne({ id });
		if (!doc) return null;

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async findByOrganizationId(organizationId: string): Promise<Product.Model[]> {
		const docs = await ProductModel.find({ organizationId });
		return docs.map((doc) => ({
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		}));
	}

	async findBySlug(slug: string): Promise<Product.Model | null> {
		const doc = await ProductModel.findOne({ slug });
		if (!doc) return null;

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async findBySku(
		sku: string,
		organizationId: string,
	): Promise<Product.Model | null> {
		const doc = await ProductModel.findOne({ sku, organizationId });
		if (!doc) return null;

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async findByBarcode(
		barcode: string,
		organizationId: string,
	): Promise<Product.Model | null> {
		const doc = await ProductModel.findOne({ barcode, organizationId });
		if (!doc) return null;

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async findByCategoryId(categoryId: string): Promise<Product.Model[]> {
		const docs = await ProductModel.find({ categoryId });
		return docs.map((doc) => ({
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		}));
	}

	async findByProductTypeId(productTypeId: string): Promise<Product.Model[]> {
		const docs = await ProductModel.find({ productTypeId });
		return docs.map((doc) => ({
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		}));
	}

	async findByOrganizationIdAndCategoryId(
		organizationId: string,
		categoryId: string,
	): Promise<Product.Model[]> {
		const docs = await ProductModel.find({ organizationId, categoryId });
		return docs.map((doc) => ({
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		}));
	}

	async findByOrganizationIdAndProductTypeId(
		organizationId: string,
		productTypeId: string,
	): Promise<Product.Model[]> {
		const docs = await ProductModel.find({ organizationId, productTypeId });
		return docs.map((doc) => ({
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		}));
	}
}
