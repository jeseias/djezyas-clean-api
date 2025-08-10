import { yoga } from "@elysiajs/graphql-yoga";
import { appResolvers, appTypeDefs } from "../../graphql/graphql-setup";
import { createGraphQLContext } from "./graphql-context";
import { maskGraphQLError } from "./graphql-error-handler";

export const graphqlConfig = yoga({
	typeDefs: appTypeDefs,
	resolvers: appResolvers,
	graphiql: false,
	path: "graphql",
	context: createGraphQLContext,
	maskedErrors: {
		maskError: maskGraphQLError,
		errorMessage: "Unexpected error.",
	},
});
