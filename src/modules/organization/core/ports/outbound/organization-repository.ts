import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { Organization } from "../../domain/entities/organization";

export type OrganizationRepository = Pick<
	Repository<Organization.Props>,
	"create" | "update" | "delete" | "findById"
> & {
	findByOwnerId(ownerId: string): Promise<Organization.Props[]>;
	findBySlug(slug: string): Promise<Organization.Props | null>;
	listStores(params: {
		page?: number;
		limit?: number;
		search?: string;
	}): Promise<{
		totalItems: number;
		items: Organization.Store[];
	}>;
};
