import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { ProductType } from "../../domain/entities/product-type";

export type ProductTypeRepository = Pick<
	Repository<ProductType.Entity>,
	"create" | "update" | "delete" | "findById"
> & {
	findByOrganizationId(
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
	}>;
	findBySlug(
		slug: string,
		organizationId: string,
	): Promise<ProductType.Entity | null>;
	findByName(
		name: string,
		organizationId: string,
	): Promise<ProductType.Entity | null>;
	findByCreatedById(createdById: string): Promise<ProductType.Entity[]>;
};
