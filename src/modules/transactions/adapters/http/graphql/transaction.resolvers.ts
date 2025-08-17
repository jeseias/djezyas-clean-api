import { makeResolver } from "@/src/main/graphql/graphql-utils";
import { transactionUseCasesFactory } from "@/src/modules/transactions/adapters/factories/transaction.use-case.factory";

export const transactionResolvers = {
	Mutation: {
		createPaymentIntent: makeResolver(async ({ input }, { userId }) => {
			const useCase =
				transactionUseCasesFactory.createCreatePaymentIntentUseCase();
			return useCase.execute({ userId, ...input });
		}),
	},
};
