import type { ProductType } from "@/src/modules/product/core/domain/entities";
import type { ProductTypeRepository } from "@/src/modules/product/core/ports/outbound/product-type-repository";
import { Slug } from "@/src/modules/shared/value-objects";
import { ProductTypeModel } from "../product-type-model";

export class MongooseProductTypeRepository implements ProductTypeRepository {
	async create(productType: ProductType.Model): Promise<ProductType.Model> {
		const doc = await ProductTypeModel.create({
			...productType,
			slug: productType.slug.toString(),
		});

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async update(data: Partial<ProductType.Model>): Promise<ProductType.Model> {
		if (!data.id) {
			throw new Error("ID is required for update");
		}

		const doc = await ProductTypeModel.findOneAndUpdate(
			{ id: data.id },
			{
				...data,
				...(data.slug && { slug: data.slug.toString() }),
			},
			{ new: true },
		);

		if (!doc) {
			throw new Error("ProductType not found");
		}

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async delete(id: string): Promise<void> {
		await ProductTypeModel.findOneAndDelete({ id });
	}

	async findById(id: string): Promise<ProductType.Model | null> {
		const doc = await ProductTypeModel.findOne({ id });
		if (!doc) return null;

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async findByOrganizationId(
		organizationId: string,
	): Promise<ProductType.Model[]> {
		const docs = await ProductTypeModel.find({ organizationId });
		return docs.map((doc) => ({
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		}));
	}

	async findBySlug(
		slug: string,
		organizationId: string,
	): Promise<ProductType.Model | null> {
		const doc = await ProductTypeModel.findOne({ slug, organizationId });
		if (!doc) return null;

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async findByName(
		name: string,
		organizationId: string,
	): Promise<ProductType.Model | null> {
		const doc = await ProductTypeModel.findOne({ name, organizationId });
		if (!doc) return null;

		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	async findByCreatedById(createdById: string): Promise<ProductType.Model[]> {
		const docs = await ProductTypeModel.find({ createdById });
		return docs.map((doc) => ({
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		}));
	}
}
