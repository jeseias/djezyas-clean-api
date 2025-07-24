import { makeResolver } from "@/src/main/graphql/graphql-utils";
import { orderUseCasesFactory } from "../../factories/orders.use-cases-factory";

export const orderResolvers = {
	Query: {},
	Mutation: {
		createOrder: makeResolver(async ({ input }, { userId }) => {
			return orderUseCasesFactory.createOrder().execute({ ...input, userId });
		}),
		updateOrderStatus: makeResolver(async ({ input }, { userId }) => {
			return orderUseCasesFactory.updateOrderStatus().execute({
				...input,
				userId,
			});
		}),
	},
};
