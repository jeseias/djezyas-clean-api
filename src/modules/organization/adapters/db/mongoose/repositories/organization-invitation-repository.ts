import type { Organization } from "../../../../core/domain/entities/organization";
import type { OrganizationInvitation } from "../../../../core/domain/entities/organization-invitation";
import type { OrganizationInvitationRepository } from "../../../../core/ports/outbound/organization-invitation-repository";
import type { OrganizationRepository } from "../../../../core/ports/outbound/organization-repository";
import { OrganizationInvitationModel } from "../organization-invitation-model";

export class MongooseOrganizationInvitationRepository
	implements OrganizationInvitationRepository
{
	constructor(
		private readonly organizationRepository: OrganizationRepository,
	) {}

	private mapToDomain(doc: any): OrganizationInvitation.Model {
		return doc.toJSON();
	}

	async create(
		invitation: OrganizationInvitation.Model,
	): Promise<OrganizationInvitation.Model> {
		const doc = await OrganizationInvitationModel.create(invitation);
		return this.mapToDomain(doc);
	}

	async findById(id: string): Promise<OrganizationInvitation.Model | null> {
		const doc = await OrganizationInvitationModel.findOne({ id });
		return doc ? this.mapToDomain(doc) : null;
	}

	async update(
		data: Partial<OrganizationInvitation.Model>,
	): Promise<OrganizationInvitation.Model> {
		const { id, ...updateData } = data;
		if (!id) {
			throw new Error("ID is required for update");
		}

		const doc = await OrganizationInvitationModel.findOneAndUpdate(
			{ id },
			updateData,
			{ new: true },
		);

		if (!doc) {
			throw new Error("Organization invitation not found");
		}

		return this.mapToDomain(doc);
	}

	async delete(id: string): Promise<void> {
		const result = await OrganizationInvitationModel.deleteOne({ id });
		if (result.deletedCount === 0) {
			throw new Error("Organization invitation not found");
		}
	}

	async findByToken(
		token: string,
	): Promise<OrganizationInvitation.Model | null> {
		const doc = await OrganizationInvitationModel.findOne({ token });
		return doc ? this.mapToDomain(doc) : null;
	}

	async findByEmailAndOrgId(
		email: string,
		organizationId: string,
	): Promise<OrganizationInvitation.Model | null> {
		const doc = await OrganizationInvitationModel.findOne({
			email,
			organizationId,
		});
		return doc ? this.mapToDomain(doc) : null;
	}

	async findByOrganizationId(
		organizationId: string,
	): Promise<OrganizationInvitation.Model[]> {
		const docs = await OrganizationInvitationModel.find({ organizationId });
		return docs.map((doc) => this.mapToDomain(doc));
	}

	async findByEmail(
		email: string,
	): Promise<OrganizationInvitation.ModelWithOrganization[]> {
		const invitations = await OrganizationInvitationModel.find({
			email,
		}).populate("organization");

		const results: OrganizationInvitation.ModelWithOrganization[] = [];

		for (const invitation of invitations) {
			const invitationData = this.mapToDomain(invitation);

			// Check if organization was populated
			if (invitation.organization) {
				const organization = this.mapToDomain(invitation.organization);
				results.push({
					...invitationData,
					organization,
				});
			} else {
				// Fallback to manual fetch if virtual field didn't work
				const organizationProps = await this.organizationRepository.findById(
					invitationData.organizationId,
				);

				if (organizationProps) {
					// Convert Props to Model by creating a Slug object
					const { Slug } = await import("@/src/modules/shared/value-objects");
					const organization: Organization.Model = {
						...organizationProps,
						slug: Slug.create(organizationProps.slug),
					};

					results.push({
						...invitationData,
						organization,
					});
				}
			}
		}

		return results;
	}
}
