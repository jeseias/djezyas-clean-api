import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { Id } from "@/src/modules/shared/value-objects";
import type { Cart } from "../entities";

export type CartRepository = Pick<
	Repository<Cart.Entity>,
	"findById" | "create" | "update" | "delete"
> & {
	findByUserId: (userId: Id) => Promise<Cart.Entity | null>;
};
