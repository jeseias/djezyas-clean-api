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
	.derive(({ request, set }) => {
		const origin = request.headers.get("origin");
		const allowedOrigins = [
			"https://djezyas.com",
			"https://www.djezyas.com",
			"http://localhost:3000",
		];

		console.log("CORS Debug - Request origin:", origin);
		console.log(
			"CORS Debug - Origin allowed:",
			allowedOrigins.includes(origin || ""),
		);

		if (origin && allowedOrigins.includes(origin)) {
			set.headers["Access-Control-Allow-Origin"] = origin;
			set.headers["Access-Control-Allow-Credentials"] = "true";
			set.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
			set.headers["Access-Control-Allow-Headers"] =
				"Content-Type, Authorization, x-access-token, Accept, Origin, X-Requested-With";
			set.headers["Access-Control-Expose-Headers"] =
				"Content-Type, Authorization, x-access-token";
			set.headers["Access-Control-Max-Age"] = "86400";
		}

		if (request.method === "OPTIONS") {
			set.status = 204;
			return;
		}
	})
	.use(protectedDocs)
	.use(
		yoga({
			typeDefs: appTypeDefs,
			resolvers: appResolvers,
			graphiql: false,
			path: "graphql",
			context: async ({ request }) => {
				console.log("GraphQL request received:", {
					method: request.method,
					url: request.url,
					headers: Object.fromEntries(request.headers.entries()),
				});

				try {
					const userContext = await getUserFromRequest(request);
					console.log("User context resolved:", userContext);
					return userContext;
				} catch (error) {
					console.error("Error in getUserFromRequest:", error);
					return { user: null };
				}
			},
			maskedErrors: {
				maskError: (
					error: unknown,
					message: string,
					isDev?: boolean,
				): Error => {
					console.log("GraphQL error details:", {
						error: error instanceof Error ? error.message : String(error),
						errorType: error?.constructor?.name,
						message,
						isDev,
						stack: error instanceof Error ? error.stack : undefined,
					});

					if (
						error instanceof GraphQLError &&
						error.originalError instanceof AppError
					) {
						console.log("AppError detected:", error.originalError);
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

					if (isDev) {
						return new Error(
							`${message}: ${error instanceof Error ? error.message : String(error)}`,
						);
					}

					return new Error(message);
				},
				errorMessage: "Unexpected error.",
			},
		}),
	)
	.use(routes)
	.options("*", ({ request, set }) => {
		// Handle all OPTIONS preflight requests
		const origin = request.headers.get("origin");
		const allowedOrigins = [
			"https://djezyas.com",
			"https://www.djezyas.com",
			"http://localhost:3000",
			"http://localhost:7878",
		];

		console.log("=== PREFLIGHT OPTIONS REQUEST ===");
		console.log("Request URL:", request.url);
		console.log("Request origin:", origin);

		if (origin && allowedOrigins.includes(origin)) {
			set.headers["Access-Control-Allow-Origin"] = origin;
			set.headers["Access-Control-Allow-Credentials"] = "true";
			set.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
			set.headers["Access-Control-Allow-Headers"] =
				"Content-Type, Authorization, x-access-token, Accept, Origin, X-Requested-With";
			set.headers["Access-Control-Expose-Headers"] =
				"Content-Type, Authorization, x-access-token";
			set.headers["Access-Control-Max-Age"] = "86400";
			console.log("Preflight CORS headers set for origin:", origin);
		} else {
			console.log("Preflight - Origin not allowed or missing:", origin);
		}

		set.status = 204;
		return;
	})
	.get("/graphiql", ({ request }) => graphiqlAuthHandler(request))
	.get("/health", () => ({ status: "ok", cors: "enabled" }))
	.post("/test", ({ body, request }) => {
		console.log("POST /test called");
		console.log("Request method:", request.method);
		console.log("Request URL:", request.url);
		console.log(
			"Request headers:",
			Object.fromEntries(request.headers.entries()),
		);
		console.log("Request body:", body);

		return {
			status: "ok",
			method: "POST",
			body: body,
			message: "POST request working",
			headers: Object.fromEntries(request.headers.entries()),
		};
	});
// Let Railway handle OPTIONS requests automatically
// The CORS plugin will handle preflight requests
