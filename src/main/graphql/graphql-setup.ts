import { mergeTypeDefs } from "@graphql-tools/merge";
import { print } from "graphql";
import { orderResolvers } from "@/src/modules/order/adapters/http/graphql/order.resolvers";
import { orderTypeDefs } from "@/src/modules/order/adapters/http/graphql/order.type-defs";
import { organizationResolvers } from "@/src/modules/organization/adapters/http/graphql/organization.resolvers";
import { organizationTypeDefs } from "@/src/modules/organization/adapters/http/graphql/organization.type-defs";
import { productResolvers } from "@/src/modules/product/adapters/http/graphql/product.resolvers";
import { productTypeDefs } from "@/src/modules/product/adapters/http/graphql/product.type-defs";
import { userResolvers } from "@/src/modules/user/adapters/http/graphql/user.resolver";
import { userTypeDefs } from "@/src/modules/user/adapters/http/graphql/user.type-defs";
import { wrapResolvers } from "../elysia/plugins/auth-middleware";

export const appTypeDefs = print(
	mergeTypeDefs([
		userTypeDefs,
		organizationTypeDefs,
		productTypeDefs,
		orderTypeDefs,
	]),
);

const PUBLIC_MUTATIONS = [
	"registerUser",
	"login",
	"verifyEmail",
	"forgotPassword",
	"resetPassword",
	"resendVerification",
];

export const appResolvers = {
	Query: wrapResolvers({
		...userResolvers.Query,
		...organizationResolvers.Query,
		...productResolvers.Query,
		...orderResolvers.Query,
	}),
	Mutation: wrapResolvers(
		{
			...userResolvers.Mutation,
			...organizationResolvers.Mutation,
			...productResolvers.Mutation,
			...orderResolvers.Mutation,
		},
		PUBLIC_MUTATIONS,
	),
};
