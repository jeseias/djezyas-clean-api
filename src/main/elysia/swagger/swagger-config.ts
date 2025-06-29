import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { _env } from "../../config/_env";

export const protectedDocs = new Elysia()
	.derive(({ request, path, set }) => {
		if (path.startsWith("/docs")) {
			const auth = request.headers.get("authorization");

			if (!auth || !auth.startsWith("Basic ")) {
				set.status = 401;
				set.headers = {
					"WWW-Authenticate": 'Basic realm="Docs"',
				};
				throw new Error("Unauthorized");
			}

			const decoded = atob(auth.replace("Basic ", ""));
			const [username, password] = decoded.split(":");

			const validUser = username === _env.SWAGGER_DOCS_USERNAME;
			const validPass = password === _env.SWAGGER_DOCS_PASSWORD;

			if (!validUser || !validPass) {
				set.status = 401;
				set.headers = {
					"WWW-Authenticate": 'Basic realm="Docs"',
				};
				throw new Error("Unauthorized");
			}
		}
	})
	.use(
		swagger({
			path: "/docs",
			documentation: {
				info: {
					title: "Kianda API",
					version: "1.0.0",
					description: "Kianda API Documentation",
				},
			},
		}),
	);
