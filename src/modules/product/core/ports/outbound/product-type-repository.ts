import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { ProductType } from "../../domain/entities/product-type";

export type ProductTypeRepository = Pick<
	Repository<ProductType.Props>,
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
		items: ProductType.Props[];
		totalItems: number;
	}>;
	findBySlug(
		slug: string,
		organizationId: string,
	): Promise<ProductType.Props | null>;
	findByName(
		name: string,
		organizationId: string,
	): Promise<ProductType.Props | null>;
	findByCreatedById(createdById: string): Promise<ProductType.Props[]>;
};
