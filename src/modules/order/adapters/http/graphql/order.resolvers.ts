import { makeResolver } from "@/src/main/graphql/graphql-utils";
import { orderUseCasesFactory } from "../../factories/orders.use-cases-factory";

export const orderResolvers = {
	Query: {
		calculateOrderTotals: makeResolver(async ({ input }) => {
			const useCase = orderUseCasesFactory.calculateOrderTotals();
			return useCase.execute(input);
		}),
		getOrderById: makeResolver(async ({ input }, { userId }) => {
			const useCase = orderUseCasesFactory.getOrderById();
			return useCase.execute({ ...input, userId });
		}),
		getOrdersByUser: makeResolver(async ({ input }, { userId }) => {
			const useCase = orderUseCasesFactory.getOrdersByUser();
			return useCase.execute({ ...input, userId });
		}),
		getOrdersByOrganization: makeResolver(async ({ input }, { userId }) => {
			const useCase = orderUseCasesFactory.getOrdersByOrganization();
			return useCase.execute({ ...input, userId });
		}),
		filterOrdersByStatus: makeResolver(async ({ input }, { userId }) => {
			const useCase = orderUseCasesFactory.filterOrdersByStatus();
			return useCase.execute({ ...input, userId });
		}),
	},
	Mutation: {
		cancelOrder: makeResolver(async ({ input }, { userId }) => {
			const useCase = orderUseCasesFactory.cancelOrder();
			return useCase.execute({ ...input, userId });
		}),
		createOrdersFromCart: makeResolver(async ({ input }, { userId }) => {
			const useCase = orderUseCasesFactory.createOrdersFromCart();
			return useCase.execute({ ...input, userId });
		}),
		expireOrder: makeResolver(async ({ input }, { userId }) => {
			const useCase = orderUseCasesFactory.expireOrder();
			return useCase.execute({ ...input, userId });
		}),
		splitCartIntoOrders: makeResolver(async ({ input }) => {
			const useCase = orderUseCasesFactory.splitCartIntoOrders();
			return useCase.execute(input);
		}),
	},
};
