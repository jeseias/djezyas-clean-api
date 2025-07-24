import type { FilterQuery } from "mongoose";
import type { Organization } from "../../../../core/domain/entities/organization";
import type { OrganizationRepository } from "../../../../core/ports/outbound/organization-repository";
import { OrganizationModel } from "../organization-model";

export class MongooseOrganizationRepository implements OrganizationRepository {
	private mapToDomain(doc: any): Organization.Props {
		return {
			...doc.toJSON(),
			slug: doc.slug,
		};
	}

	private mapToStore(doc: any): Organization.Store {
		try {
			console.log("🔍 [DEBUG] mapToStore - input doc:", {
				id: doc.id,
				name: doc.name,
				slug: doc.slug,
				logoUrl: doc.logoUrl,
				createdAt: doc.createdAt,
			});

			const result = {
				slug: doc.slug,
				name: doc.name,
				logoUrl: doc.logoUrl,
				createdAt: doc.createdAt,
			};

			console.log("🔍 [DEBUG] mapToStore - result:", result);
			return result;
		} catch (error) {
			console.error("❌ [DEBUG] Error in mapToStore:", {
				error:
					error instanceof Error
						? {
								name: error.name,
								message: error.message,
								stack: error.stack,
							}
						: error,
				doc: {
					id: doc?.id,
					name: doc?.name,
					slug: doc?.slug,
					logoUrl: doc?.logoUrl,
					createdAt: doc?.createdAt,
				},
			});
			throw error;
		}
	}

	private mapToDatabase(organization: Organization.Props) {
		return {
			...organization,
			slug: organization.slug,
		};
	}

	async create(organization: Organization.Props): Promise<Organization.Props> {
		const doc = await OrganizationModel.create(
			this.mapToDatabase(organization),
		);
		return this.mapToDomain(doc);
	}

	async findById(id: string): Promise<Organization.Props | null> {
		const doc = await OrganizationModel.findOne({ id });
		if (!doc) return null;

		return this.mapToDomain(doc);
	}

	async update(data: Partial<Organization.Props>): Promise<Organization.Props> {
		const { id, ...updateData } = data;
		if (!id) {
			throw new Error("ID is required for update");
		}

		const doc = await OrganizationModel.findOneAndUpdate(
			{ id },
			{
				...updateData,
				...(updateData.slug && { slug: updateData.slug.toString() }),
			},
			{ new: true },
		);

		if (!doc) {
			throw new Error("Organization not found");
		}

		return this.mapToDomain(doc);
	}

	async delete(id: string): Promise<void> {
		const result = await OrganizationModel.deleteOne({ id });
		if (result.deletedCount === 0) {
			throw new Error("Organization not found");
		}
	}

	async findByOwnerId(ownerId: string): Promise<Organization.Props[]> {
		const docs = await OrganizationModel.find({ ownerId });
		return docs.map((doc) => this.mapToDomain(doc));
	}

	async findBySlug(slug: string): Promise<Organization.Props | null> {
		const doc = await OrganizationModel.findOne({ slug });
		if (!doc) return null;

		return this.mapToDomain(doc);
	}

	async listStores(params: {
		page?: number;
		limit?: number;
		search?: string;
	}): Promise<{ totalItems: number; items: Organization.Store[] }> {
		try {
			console.log("🔍 [DEBUG] listStores repository - params:", params);

			const { page = 1, limit = 10, search } = params;

			const query: FilterQuery<Organization.Model> = {};

			if (search) {
				query.name = { $regex: search, $options: "i" };
			}

			console.log("🔍 [DEBUG] listStores repository - query:", query);

			const total = await OrganizationModel.countDocuments(query);
			console.log("🔍 [DEBUG] listStores repository - total:", total);

			const items = await OrganizationModel.find(query)
				.skip((page - 1) * limit)
				.limit(limit)
				.sort({ createdAt: -1 });

			console.log(
				"🔍 [DEBUG] listStores repository - raw items count:",
				items.length,
			);

			const mappedItems = items.map((item) => {
				console.log("🔍 [DEBUG] listStores repository - mapping item:", {
					id: item.id,
					name: item.name,
					slug: item.slug,
					logoUrl: item.logoUrl,
				});
				return this.mapToStore(item);
			});

			console.log(
				"🔍 [DEBUG] listStores repository - mapped items:",
				mappedItems,
			);

			return {
				totalItems: total,
				items: mappedItems,
			};
		} catch (error) {
			console.error("❌ [DEBUG] Error in listStores repository:", {
				error:
					error instanceof Error
						? {
								name: error.name,
								message: error.message,
								stack: error.stack,
							}
						: error,
				params,
			});
			throw error;
		}
	}
}
