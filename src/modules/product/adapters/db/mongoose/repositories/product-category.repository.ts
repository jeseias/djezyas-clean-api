import type { ProductCategory } from "@/src/modules/product/core/domain/entities";
import type { ProductCategoryRepository } from "@/src/modules/product/core/ports/outbound/product-category-repository";
import {
	type ProductCategoryDocument,
	ProductCategoryModel,
} from "../models/product-category.model";

export class MongooseProductCategoryRepository
	implements ProductCategoryRepository
{
	async create(
		productCategory: ProductCategory.Props,
	): Promise<ProductCategory.Props> {
		const doc = await ProductCategoryModel.create(productCategory);

		return this.toDomainProps(doc);
	}

	async update(
		data: Partial<ProductCategory.Props>,
	): Promise<ProductCategory.Props> {
		if (!data.id) {
			throw new Error("ID is required for update");
		}

		const doc = await ProductCategoryModel.findOneAndUpdate(
			{ id: data.id },
			{ ...data },
			{ new: true },
		);

		if (!doc) {
			throw new Error("ProductCategory not found");
		}

		return this.toDomainProps(doc);
	}

	async delete(id: string): Promise<void> {
		await ProductCategoryModel.findOneAndDelete({ id });
	}

	async findById(id: string): Promise<ProductCategory.Props | null> {
		const doc = await ProductCategoryModel.findOne({ id });
		if (!doc) return null;

		return this.toDomainProps(doc);
	}

	async findBySlug(slug: string): Promise<ProductCategory.Props | null> {
		const doc = await ProductCategoryModel.findOne({ slug });
		if (!doc) return null;

		return this.toDomainProps(doc);
	}

	async findAll(): Promise<ProductCategory.Props[]> {
		const docs = await ProductCategoryModel.find();
		return docs.map(this.toDomainProps);
	}

	private toDomainProps(doc: ProductCategoryDocument): ProductCategory.Props {
		return {
			id: doc.id,
			name: doc.name,
			createdAt: doc.createdAt,
			slug: doc.slug,
			updatedAt: doc.updatedAt,
			description: doc.description,
		};
	}
}
