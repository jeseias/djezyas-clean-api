import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { ProductType } from "../../domain/entities/product-type";

export type ProductTypeRepository = Pick<
	Repository<ProductType.Model>,
	"create" | "update" | "delete" | "findById"
> & {
	findByOrganizationId(organizationId: string): Promise<ProductType.Model[]>;
	findBySlug(
		slug: string,
		organizationId: string,
	): Promise<ProductType.Model | null>;
	findByName(
		name: string,
		organizationId: string,
	): Promise<ProductType.Model | null>;
	findByCreatedById(createdById: string): Promise<ProductType.Model[]>;
};
