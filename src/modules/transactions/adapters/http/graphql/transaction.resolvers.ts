import { makeResolver } from "@/src/main/graphql/graphql-utils";
import { transactionUseCasesFactory } from "@/src/modules/transactions/adapters/factories/transaction.use-case.factory";

export const transactionResolvers = {
	Query: {
		checkoutSession: makeResolver(
			async (_, { token }) => {
				const useCase =
					transactionUseCasesFactory.createGetCheckoutSessionUseCase();
				const result = await useCase.execute({ token });
				console.log({ result });
				return result;
			},
			{ requireAuth: false },
		),
	},
	Mutation: {
		createPaymentIntent: makeResolver(async ({ input }, { userId }) => {
			const useCase =
				transactionUseCasesFactory.createCreatePaymentIntentUseCase();
			return useCase.execute({ userId, ...input });
		}),
	},
};
