import { Slug } from "@/src/modules/shared/value-objects";
import type { Organization } from "../../../../core/domain/entities/organization";
import type { OrganizationRepository } from "../../../../core/ports/outbound/organization-repository";
import { OrganizationModel } from "../organization-model";

export class MongooseOrganizationRepository implements OrganizationRepository {
	private mapToDomain(doc: any): Organization.Model {
		return {
			...doc.toJSON(),
			slug: Slug.fromValue(doc.slug),
		};
	}

	private mapToDatabase(organization: Organization.Model) {
		return {
			...organization,
			slug: organization.slug.toString(),
		};
	}

	async create(organization: Organization.Model): Promise<Organization.Model> {
		const doc = await OrganizationModel.create(
			this.mapToDatabase(organization),
		);
		return this.mapToDomain(doc);
	}

	async findById(id: string): Promise<Organization.Model | null> {
		const doc = await OrganizationModel.findOne({ id });
		if (!doc) return null;

		return this.mapToDomain(doc);
	}

	async update(data: Partial<Organization.Model>): Promise<Organization.Model> {
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

	async findByOwnerId(ownerId: string): Promise<Organization.Model[]> {
		const docs = await OrganizationModel.find({ ownerId });
		return docs.map((doc) => this.mapToDomain(doc));
	}
}
