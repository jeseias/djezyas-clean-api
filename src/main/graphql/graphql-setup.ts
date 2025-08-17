import { mergeTypeDefs } from "@graphql-tools/merge";
import { print } from "graphql";
import { cartResolvers } from "@/src/modules/order/adapters/http/graphql/cart.resolvers";
import { cartTypeDefs } from "@/src/modules/order/adapters/http/graphql/cart.type-defs";
import { orderResolvers } from "@/src/modules/order/adapters/http/graphql/order.resolvers";
import { orderTypeDefs } from "@/src/modules/order/adapters/http/graphql/order.type-defs";
import { organizationResolvers } from "@/src/modules/organization/adapters/http/graphql/organization.resolvers";
import { organizationTypeDefs } from "@/src/modules/organization/adapters/http/graphql/organization.type-defs";
import { productResolvers } from "@/src/modules/product/adapters/http/graphql/product.resolvers";
import { productTypeDefs } from "@/src/modules/product/adapters/http/graphql/product.type-defs";
import { userResolvers } from "@/src/modules/user/adapters/http/graphql/user.resolver";
import { userTypeDefs } from "@/src/modules/user/adapters/http/graphql/user.type-defs";
import { transactionResolvers, transactionTypeDefs } from "@/src/modules/transactions/adapters/http/graphql";

export const appTypeDefs = print(
	mergeTypeDefs([
		userTypeDefs,
		organizationTypeDefs,
		productTypeDefs,
		orderTypeDefs,
		cartTypeDefs,
    transactionTypeDefs
	]),
);

export const appResolvers = {
	Query: {
		...userResolvers.Query,
		...organizationResolvers.Query,
		...productResolvers.Query,
		...orderResolvers.Query,
		...cartResolvers.Query,
	},
	Mutation: {
		...userResolvers.Mutation,
		...organizationResolvers.Mutation,
		...productResolvers.Mutation,
		...orderResolvers.Mutation,
		...cartResolvers.Mutation,
    ...transactionResolvers.Mutation
	},
};
