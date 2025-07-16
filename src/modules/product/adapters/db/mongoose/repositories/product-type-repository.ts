import { ProductType } from "@/src/modules/product/core/domain/entities";
import type { ProductTypeRepository } from "@/src/modules/product/core/ports/outbound/product-type-repository";
import {
	type ProductTypeDocument,
	ProductTypeModel,
} from "../product-type-model";

export class MongooseProductTypeRepository implements ProductTypeRepository {
	async create(productType: ProductType.Model): Promise<ProductType.Entity> {
		const doc = await ProductTypeModel.create({
			...productType,
			slug: productType.slug.toString(),
		});

		return this.toDomainEntity(doc);
	}

	async update(data: Partial<ProductType.Model>): Promise<ProductType.Entity> {
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

		return this.toDomainEntity(doc);
	}

	async delete(id: string): Promise<void> {
		await ProductTypeModel.findOneAndDelete({ id });
	}

	async findById(id: string): Promise<ProductType.Entity | null> {
		const doc = await ProductTypeModel.findOne({ id });
		if (!doc) return null;

		return this.toDomainEntity(doc);
	}

	async findByOrganizationId(
		organizationId: string,
		options?: {
			page?: number;
			limit?: number;
			sort?: string;
			order?: string;
			search?: string;
		},
	): Promise<{
		items: ProductType.Entity[];
		totalItems: number;
	}> {
		const query: any = { organizationId };

		if (options?.search) {
			query.$or = [
				{ name: { $regex: options.search, $options: "i" } },
				{ description: { $regex: options.search, $options: "i" } },
			];
		}

		let sortObj: any = {};
		if (options?.sort) {
			const sortOrder = options.order === "desc" ? -1 : 1;
			sortObj[options.sort] = sortOrder;
		} else {
			sortObj = { createdAt: -1 };
		}

		const page = options?.page || 1;
		const limit = options?.limit || 10;
		const skip = (page - 1) * limit;

		const totalItems = await ProductTypeModel.countDocuments(query);

		const docs = await ProductTypeModel.find(query)
			.sort(sortObj)
			.skip(skip)
			.limit(limit);

		const items = docs.map((doc) => this.toDomainEntity(doc));

		return {
			items,
			totalItems,
		};
	}

	async findBySlug(
		slug: string,
		organizationId: string,
	): Promise<ProductType.Entity | null> {
		const doc = await ProductTypeModel.findOne({ slug, organizationId });
		if (!doc) return null;

		return this.toDomainEntity(doc);
	}

	async findByName(
		name: string,
		organizationId: string,
	): Promise<ProductType.Entity | null> {
		const doc = await ProductTypeModel.findOne({ name, organizationId });
		if (!doc) return null;

		return this.toDomainEntity(doc);
	}

	async findByCreatedById(createdById: string): Promise<ProductType.Entity[]> {
		const docs = await ProductTypeModel.find({ createdById });
		return docs.map((doc) => this.toDomainEntity(doc));
	}

	private toDomainEntity(doc: ProductTypeDocument): ProductType.Entity {
		return ProductType.Entity.fromModel({
			id: doc.id,
			name: doc.name,
			slug: doc.slug,
			description: doc.description,
			organizationId: doc.organizationId,
			createdById: doc.createdById,
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt,
		});
	}
}
