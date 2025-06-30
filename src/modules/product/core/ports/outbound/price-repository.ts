import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { Price } from "../../domain/entities/price";

export type PriceRepository = Pick<
	Repository<Price.Model>,
	"create" | "update" | "delete" | "findById"
> & {
	findByProductId(productId: string): Promise<Price.Model[]>;
	findByProductIdAndCurrencyId(
		productId: string,
		currencyId: string,
	): Promise<Price.Model[]>;
};
