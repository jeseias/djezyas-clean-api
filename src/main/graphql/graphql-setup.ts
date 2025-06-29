import { mergeTypeDefs } from "@graphql-tools/merge";
import { print } from "graphql";
import { userResolvers } from "@/src/modules/user/adapters/http/graphql/user.resolver";
import { userTypeDefs } from "@/src/modules/user/adapters/http/graphql/user.type-defs";

export const appTypeDefs = print(mergeTypeDefs([userTypeDefs]));

export const appResolvers = {
	Query: {
		...userResolvers.Query,
	},
	Mutation: {
		...userResolvers.Mutation,
	},
};
