import type { Id } from "@/src/modules/shared/value-objects";
import type { Cart } from "../entities";

export type CartRepository = {
	save: (cart: Cart.Model) => Promise<Cart.Model>;
	findByUserId: (userId: Id) => Promise<Cart.Model | null>;
	delete: (cart: Cart.Model) => Promise<void>;
};
