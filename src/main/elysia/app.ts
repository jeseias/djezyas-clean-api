import { Elysia } from "elysia";
import { corsMiddleware } from "./plugins/cors-middleware";
import { graphiqlAuthHandler } from "./plugins/graphiql-auth";
import { graphqlConfig } from "./plugins/graphql-config";
import { preflightHandler } from "./plugins/preflight-handler";
import { routes } from "./routes";
import { protectedDocs } from "./swagger/swagger-config";

export const app = new Elysia()
	.use(corsMiddleware)
	.use(protectedDocs)
	.use(graphqlConfig)
	.use(routes)
	.use(preflightHandler)
	.get("/graphiql", ({ request }) => graphiqlAuthHandler(request))
	.get("/health", () => ({ status: "ok", cors: "enabled" }));
