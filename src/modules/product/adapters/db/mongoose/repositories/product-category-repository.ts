import type { ProductCategory } from "@/src/modules/product/core/domain/entities";
import type { ProductCategoryRepository } from "@/src/modules/product/core/ports/outbound/product-category-repository";
import { Slug } from "@/src/modules/shared/value-objects";
import { ProductCategoryModel } from "../product-category-model";

export class MongooseProductCategoryRepository
	implements ProductCategoryRepository
{
	async create(
		productCategory: ProductCategory.Model,
	): Promise<ProductCategory.Model> {
		const doc = await ProductCategoryModel.create({
			...productCategory,
			slug: productCategory.slug.toString(),
		});

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async update(
		data: Partial<ProductCategory.Model>,
	): Promise<ProductCategory.Model> {
		if (!data.id) {
			throw new Error("ID is required for update");
		}

		const doc = await ProductCategoryModel.findOneAndUpdate(
			{ id: data.id },
			{
				...data,
				...(data.slug && { slug: data.slug.toString() }),
			},
			{ new: true },
		);

		if (!doc) {
			throw new Error("ProductCategory not found");
		}

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async delete(id: string): Promise<void> {
		await ProductCategoryModel.findOneAndDelete({ id });
	}

	async findById(id: string): Promise<ProductCategory.Model | null> {
		const doc = await ProductCategoryModel.findOne({ id });
		if (!doc) return null;

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async findBySlug(slug: string): Promise<ProductCategory.Model | null> {
		const doc = await ProductCategoryModel.findOne({ slug });
		if (!doc) return null;

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async findAll(): Promise<ProductCategory.Model[]> {
		const docs = await ProductCategoryModel.find();
		return docs.map((doc) => ({
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		}));
	}
}
