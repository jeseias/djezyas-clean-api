import {
	productMongooseRepository,
} from "@/src/modules/product/adapters/factories/repository.factory";
import type { ProductRepository } from "@/src/modules/product/core/ports/outbound/product-repository";
import {
	AddToCartUseCase,
	ClearCartUseCase,
	GetCartUseCase,
	RemoveItemFromCartUseCase,
	UpdateItemQuantityUseCase,
	ValidateCartUseCase,
} from "../../app/use-cases/cart";
import type { CartRepository } from "../../domain/repositories/cart-repository";
import { cartMongooseRepository } from "./repository.factory";

export class CartUseCasesFactory {
	constructor(
		private readonly cartRepository: CartRepository,
		private readonly productRepository: ProductRepository,
	) {}

	addToCart() {
		return new AddToCartUseCase(
			this.cartRepository,
			this.productRepository,
		);
	}

	clearCart() {
		return new ClearCartUseCase(this.cartRepository);
	}

	getCart() {
		return new GetCartUseCase(
			this.cartRepository,
			this.productRepository,
		);
	}

	removeItem() {
		return new RemoveItemFromCartUseCase(this.cartRepository);
	}

	updateItemQuantity() {
		return new UpdateItemQuantityUseCase(this.cartRepository);
	}

	validateCart() {
		return new ValidateCartUseCase(
			this.cartRepository,
			this.productRepository,
		);
	}
}

export const cartUseCasesFactory = new CartUseCasesFactory(
	cartMongooseRepository,
	productMongooseRepository,
); 