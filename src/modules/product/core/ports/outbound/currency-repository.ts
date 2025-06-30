import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { Currency } from "../../domain/entities/currency";

export type CurrencyRepository = Pick<
	Repository<Currency.Model>,
	"create" | "update" | "delete" | "findById"
> & {
	findByCode(code: string): Promise<Currency.Model | null>;
	findActive(): Promise<Currency.Model[]>;
	findByStatus(status: Currency.Status): Promise<Currency.Model[]>;
};
