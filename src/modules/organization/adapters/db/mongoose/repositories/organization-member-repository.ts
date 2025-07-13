import type { OrganizationMember } from "../../../../core/domain/entities/organization-member";
import type { OrganizationMemberRepository } from "../../../../core/ports/outbound/organization-member-repository";
import { OrganizationMemberModel } from "../organization-member-model";

export class MongooseOrganizationMemberRepository
	implements OrganizationMemberRepository
{
	private mapToDomain(doc: any): OrganizationMember.Model {
		return doc.toJSON();
	}

	async create(
		member: OrganizationMember.Model,
	): Promise<OrganizationMember.Model> {
		const doc = await OrganizationMemberModel.create(member);
		return this.mapToDomain(doc);
	}

	async findById(id: string): Promise<OrganizationMember.Model | null> {
		const doc = await OrganizationMemberModel.findOne({ id });
		return doc ? this.mapToDomain(doc) : null;
	}

	async update(
		data: Partial<OrganizationMember.Model>,
	): Promise<OrganizationMember.Model> {
		const { id, ...updateData } = data;
		if (!id) {
			throw new Error("ID is required for update");
		}

		const doc = await OrganizationMemberModel.findOneAndUpdate(
			{ id },
			updateData,
			{ new: true },
		);

		if (!doc) {
			throw new Error("Organization member not found");
		}

		return this.mapToDomain(doc);
	}

	async delete(id: string): Promise<void> {
		const result = await OrganizationMemberModel.deleteOne({ id });
		if (result.deletedCount === 0) {
			throw new Error("Organization member not found");
		}
	}

	async findByUserId(params: {
		userId: string;
		organizationId: string;
	}): Promise<OrganizationMember.Model | null> {
		const { userId, organizationId } = params;
		const doc = await OrganizationMemberModel.findOne({
			userId,
			organizationId,
		});
		return doc ? this.mapToDomain(doc) : null;
	}

	async findAllByUserId(userId: string): Promise<OrganizationMember.Model[]> {
		const docs = await OrganizationMemberModel.find({ userId });
		return docs.map((doc) => this.mapToDomain(doc));
	}

	async findByOrganizationId(
		organizationId: string,
	): Promise<OrganizationMember.Model[]> {
		const docs = await OrganizationMemberModel.find({ organizationId });
		return docs.map((doc) => this.mapToDomain(doc));
	}
}
