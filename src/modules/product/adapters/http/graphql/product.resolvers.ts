import { makeResolver } from "@/src/main/graphql/graphql-utils";
import { productUseCasesFactory } from "../../factories";

export const productResolvers = {
	Query: {
		findProductByOrganization: makeResolver(async ({ input }, { userId }) => {
			return productUseCasesFactory
				.findProductsByOrganization()
				.execute({ ...input, userId });
		}),
		getProductById: makeResolver(async ({ input }, { userId }) => {
			return productUseCasesFactory
				.getProductById()
				.execute({ ...input, userId });
		}),
		loadPricesByProductId: makeResolver(async ({ input }, { userId }) => {
			return productUseCasesFactory
				.loadPricesByProductId()
				.execute({ ...input, userId });
		}),
		listProductCategories: makeResolver(async ({ input }) => {
			return productUseCasesFactory.listProductCategories().execute(input);
		}),
		listProductTypes: makeResolver(async ({ input }, { userId }) => {
			return productUseCasesFactory
				.listProductTypes()
				.execute({ ...input, userId });
		}),
		listB2CProducts: makeResolver(
			async (_, { input }) => {
				const filters = input.filters || {};
				const { page = 1, limit = 20, ...otherFilters } = filters;
				const offset = (page - 1) * limit;

				return productUseCasesFactory.listB2CProducts().execute({
					filters: {
						...otherFilters,
						limit,
						offset,
					},
				});
			},
			{ requireAuth: false },
		),
	},
	Mutation: {
		addPrice: makeResolver(async ({ input }) => {
			return productUseCasesFactory.addPrice().execute(input);
		}),

		createProductCategory: makeResolver(
			async ({ input }) => {
				return productUseCasesFactory.createProductCategory().execute(input);
			},
			{ isAdmin: true },
		),

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

		updatePriceAmount: makeResolver(async ({ input }, { userId }) => {
			return productUseCasesFactory
				.updatePriceAmount()
				.execute({ ...input, userId });
		}),

		updatePriceStatus: makeResolver(async ({ input }, { userId }) => {
			return productUseCasesFactory
				.updatePriceStatus()
				.execute({ ...input, userId });
		}),

		updateProductStatus: makeResolver(async ({ input }, { userId }) => {
			return productUseCasesFactory
				.updateProductStatus()
				.execute({ ...input, userId });
		}),
	},
};
