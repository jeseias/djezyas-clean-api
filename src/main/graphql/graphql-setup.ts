import { mergeTypeDefs } from "@graphql-tools/merge";
import { print } from "graphql";
import { organizationResolvers } from "@/src/modules/organization/adapters/http/graphql/organization.resolvers";
import { organizationTypeDefs } from "@/src/modules/organization/adapters/http/graphql/organization.type-defs";
import { userResolvers } from "@/src/modules/user/adapters/http/graphql/user.resolver";
import { userTypeDefs } from "@/src/modules/user/adapters/http/graphql/user.type-defs";

export const appTypeDefs = print(
	mergeTypeDefs([userTypeDefs, organizationTypeDefs]),
);

export const appResolvers = {
	Query: {
		...userResolvers.Query,
		...organizationResolvers.Query,
	},
	Mutation: {
		...userResolvers.Mutation,
		...organizationResolvers.Mutation,
	},
};
