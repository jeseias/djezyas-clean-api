import { makeResolver } from "@/src/main/graphql/graphql-utils";
import { orderUseCasesFactory } from "../../factories/use-cases.factory";

export const orderResolvers = {
	Mutation: {
		createOrder: makeResolver(async ({ input }, { userId }) => {
			return orderUseCasesFactory.createOrder().execute({ ...input, userId });
		}),
	},
};
