import { _env } from "./main/config/_env";
import { app } from "./main/elysia/app";
import { Server } from "./main/server";

async function main() {
	try {
		const config = {
			port: _env.PORT,
			mongodbUri: _env.MONGODB_URI,
			app,
		};

		const server = new Server(config);
		await server.start();

		setInterval(() => {
			const stats = server.getStats();
			if (stats) {
				console.log(`📊 Server uptime: ${Math.floor(stats.uptime / 1000)}s`);
			}
		}, 60000); // Log every minute
	} catch (error) {
		console.error("❌ Failed to start application:", error);
		process.exit(1);
	}
}

main();
