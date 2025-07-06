import { cors } from "@elysiajs/cors";
import { yoga } from "@elysiajs/graphql-yoga";
import { Elysia } from "elysia";
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
			maskedErrors: false,
		}),
	)
	.use(routes)
	.get("/graphiql", ({ request }) => graphiqlAuthHandler(request));
