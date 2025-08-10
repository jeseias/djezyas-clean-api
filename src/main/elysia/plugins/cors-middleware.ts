import type { Elysia } from "elysia";

export const corsMiddleware = (app: Elysia) =>
	app.derive(({ request, set }) => {
		const origin = request.headers.get("origin");
		const allowedOrigins = [
			"https://djezyas.com",
			"https://www.djezyas.com",
			"http://localhost:3000",
		];

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
	});
