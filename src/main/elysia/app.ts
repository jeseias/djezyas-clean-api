import { cors } from "@elysiajs/cors";
import { yoga } from "@elysiajs/graphql-yoga";
import { Elysia } from "elysia";
import { GraphQLError } from "graphql";
import { AppError } from "@/src/modules/shared/errors/app-error";
import { appResolvers, appTypeDefs } from "../graphql/graphql-setup";
import { getUserFromRequest } from "./plugins/auth-middleware";
import { graphiqlAuthHandler } from "./plugins/graphiql-auth";
import { routes } from "./routes";
import { protectedDocs } from "./swagger/swagger-config";

export const app = new Elysia()
	.use(cors())
	.use(protectedDocs)
	.use(
		yoga({
			typeDefs: appTypeDefs,
			resolvers: appResolvers,
			graphiql: false,
			path: "graphql",
			context: async ({ request }) => getUserFromRequest(request),
			maskedErrors: {
				maskError: (error) => {
					if (
						error instanceof GraphQLError &&
						error.originalError instanceof AppError
					) {
						return new GraphQLError(error.message, {
							nodes: error.nodes,
							source: error.source,
							positions: error.positions,
							path: error.path,
							originalError: error.originalError,
							extensions: {
								...error.extensions,
								code: error.originalError.code,
							},
						});
					}
					return error;
				},
				errorMessage: "Unexpected error.",
			},
		}),
	)
	.use(routes)
	.get("/graphiql", ({ request }) => graphiqlAuthHandler(request));
