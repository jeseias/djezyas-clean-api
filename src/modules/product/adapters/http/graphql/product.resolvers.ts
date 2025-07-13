import { makeResolver } from "@/src/main/graphql/graphql-utils";
import { productUseCasesFactory } from "../../factories";

export const productResolvers = {
	Query: {
		Query: {
			findProductByOrganization: makeResolver(async ({ input }, { userId }) => {
				return productUseCasesFactory
					.findProductsByOrganization()
					.execute({ ...input, userId });
			}),
		},
	},
	Mutation: {
		addPrice: makeResolver(async ({ input }) => {
			return productUseCasesFactory.addPrice().execute(input);
		}),

		createProductCategory: makeResolver(async ({ input }) => {
			return productUseCasesFactory.createProductCategory().execute(input);
		}),

		saveProduct: makeResolver(async ({ input }, { userId }) => {
			return productUseCasesFactory.saveProduct().execute({
				...input,
				createdById: userId,
				dimensions: input.dimensions
					? {
							length: input.dimensions.length!,
							width: input.dimensions.width!,
							height: input.dimensions.height!,
						}
					: undefined,
			});
		}),

		saveProductType: makeResolver(async ({ input }, { userId }) => {
			return productUseCasesFactory
				.saveProductType()
				.execute({ ...input, userId });
		}),

		saveCurrency: makeResolver(async ({ input }) => {
			return productUseCasesFactory.saveCurrency().execute({
				id: input.currencyId,
				...input,
			});
		}),
	},
};
