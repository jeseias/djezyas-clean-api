import { Elysia } from "elysia";
import { graphiqlAuthHandler } from "./plugins/graphiql-auth";
import { corsMiddleware } from "./plugins/cors-middleware";
import { preflightHandler } from "./plugins/preflight-handler";
import { graphqlConfig } from "./plugins/graphql-config";
import { routes } from "./routes";
import { protectedDocs } from "./swagger/swagger-config";

export const app = new Elysia()
	.use(corsMiddleware)
	.use(protectedDocs)
	.use(graphqlConfig)
	.use(routes)
	.use(preflightHandler)
	.get("/graphiql", ({ request }) => graphiqlAuthHandler(request))
	.get("/health", () => ({ status: "ok", cors: "enabled" }))
