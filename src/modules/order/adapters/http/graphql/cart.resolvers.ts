import { makeResolver } from "@/src/main/graphql/graphql-utils";
import { cartUseCasesFactory } from "@/src/modules/order/adapters/factories";

export const cartResolvers = {
	Query: {
		cart: makeResolver(async (_args, { userId }) => {
			const useCase = cartUseCasesFactory.getCart();
			return useCase.execute({ userId });
		}),
		cartSummary: makeResolver(async (_args, { userId }) => {
			const useCase = cartUseCasesFactory.getCart();
			const cart = await useCase.execute({ userId });
			const total = cart.items.reduce(
				(sum, item) =>
					sum + item.quantity * (item.product?.price.unitAmount || 0),
				0,
			);
			const currency = cart.items[0]?.product?.price.currency || "AOA";
			return {
				itemCount: cart.itemCount,
				totalPrice: { currency, value: total },
			};
		}),
		validateCart: makeResolver(async (_args, { userId }) => {
			const useCase = cartUseCasesFactory.validateCart();
			return useCase.execute({ userId });
		}),
	},
	Mutation: {
		addToCart: makeResolver(async ({ input }, { userId }) => {
			const useCase = cartUseCasesFactory.addToCart();
			return useCase.execute({ userId, ...input });
		}),
		reduceItemQuantity: makeResolver(async ({ input }, { userId }) => {
			const useCase = cartUseCasesFactory.reduceItemQuantity();
			return useCase.execute({ userId, ...input });
		}),
		removeItem: makeResolver(async ({ input }, { userId }) => {
			const useCase = cartUseCasesFactory.removeItem();
			return useCase.execute({ userId, ...input });
		}),
		clearCart: makeResolver(async (_args, { userId }) => {
			const useCase = cartUseCasesFactory.clearCart();
			return useCase.execute({ userId });
		}),
	},
};
