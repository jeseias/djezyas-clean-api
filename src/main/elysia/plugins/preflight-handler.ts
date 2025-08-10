import type { Elysia } from "elysia";

export const preflightHandler = (app: Elysia) =>
	app.options("*", ({ request, set }) => {
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
	});
