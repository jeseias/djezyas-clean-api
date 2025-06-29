import { mergeTypeDefs } from "@graphql-tools/merge";
import { print } from "graphql";

export const appTypeDefs = print(mergeTypeDefs([]));

export const appResolvers = {
	Query: {},
	Mutation: {},
};
