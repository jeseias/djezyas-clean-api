import { cors } from "@elysiajs/cors";
import { yoga } from "@elysiajs/graphql-yoga";
import { Elysia } from "elysia";
import { renderGraphiQL } from "graphql-yoga";
import { appResolvers, appTypeDefs } from "../graphql/graphql-setup";
import { authMiddleware } from "./plugins";
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
		}),
	)
	.derive(authMiddleware)
	.use(routes)
	.get("/graphiql", () => {
		return new Response(renderGraphiQL({ endpoint: "/graphql" }), {
			headers: { "Content-Type": "text/html" },
		});
	});
