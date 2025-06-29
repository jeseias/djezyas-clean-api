import mongoose from "mongoose";
import { _env } from "../config/_env";

export interface ServerConfig {
	port: number;
	mongodbUri: string;
	app: any;
}

export interface ServerStats {
	uptime: number;
	memoryUsage: NodeJS.MemoryUsage;
	connections: number;
}

export class Server {
	private config: ServerConfig;
	private isRunning = false;
	private startTime: number | null = null;
	private server: any = null;

	constructor(config: ServerConfig) {
		this.config = config;
		this.setupProcessHandlers();
	}

	async start(): Promise<void> {
		try {
			console.log("🚀 Initializing server...");

			await this.connectToDatabase();

			await this.startHttpServer();

			this.isRunning = true;
			this.startTime = Date.now();

			this.logServerInfo();
		} catch (error) {
			console.error("❌ Failed to start server:", error);
			await this.cleanup();
			throw error;
		}
	}

	async stop(): Promise<void> {
		if (!this.isRunning) {
			console.log("ℹ️ Server is not running");
			return;
		}

		console.log("🛑 Shutting down server...");

		try {
			if (this.server) {
				await new Promise<void>((resolve) => {
					this.server.close(() => resolve());
				});
			}

			await this.disconnectFromDatabase();

			this.isRunning = false;
			this.startTime = null;
			this.server = null;

			console.log("✅ Server stopped successfully");
		} catch (error) {
			console.error("❌ Error during server shutdown:", error);
			throw error;
		}
	}

	getStats(): ServerStats | null {
		if (!this.isRunning || !this.startTime) {
			return null;
		}

		return {
			uptime: Date.now() - this.startTime,
			memoryUsage: process.memoryUsage(),
			connections: mongoose.connection.readyState === 1 ? 1 : 0,
		};
	}

	isServerRunning(): boolean {
		return this.isRunning;
	}

	private async connectToDatabase(): Promise<void> {
		try {
			console.log("🔄 Connecting to MongoDB...");
			await mongoose.connect(this.config.mongodbUri);
			console.log("✅ Connected to MongoDB successfully");
		} catch (error) {
			console.error("❌ Failed to connect to MongoDB:", error);
			throw error;
		}
	}

	private async disconnectFromDatabase(): Promise<void> {
		if (mongoose.connection.readyState === 1) {
			await mongoose.connection.close();
			console.log("✅ Database connection closed");
		}
	}

	private async startHttpServer(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.server = this.config.app.listen(this.config.port, () => {
					console.log(`✅ HTTP server started on port ${this.config.port}`);
					resolve();
				});

				this.server.on("error", (error: Error) => {
					console.error("❌ HTTP server error:", error);
					reject(error);
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	private setupProcessHandlers(): void {
		process.on("SIGINT", async () => {
			console.log("\n🛑 Received SIGINT, shutting down gracefully...");
			await this.stop();
			process.exit(0);
		});

		process.on("SIGTERM", async () => {
			console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
			await this.stop();
			process.exit(0);
		});

		process.on("uncaughtException", async (error) => {
			console.error("❌ Uncaught Exception:", error);
			await this.cleanup();
			process.exit(1);
		});

		process.on("unhandledRejection", async (reason, promise) => {
			console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
			await this.cleanup();
			process.exit(1);
		});
	}

	private async cleanup(): Promise<void> {
		try {
			if (this.isRunning) {
				await this.stop();
			} else {
				await this.disconnectFromDatabase();
			}
		} catch (error) {
			console.error("❌ Error during cleanup:", error);
		}
	}

	private logServerInfo(): void {
		console.log("\n" + "=".repeat(50));
		console.log("🎉 Server is running successfully!");
		console.log("=".repeat(50));
		console.log(`🌐 Server URL: http://localhost:${this.config.port}`);
		console.log(
			`📊 GraphQL endpoint: http://localhost:${this.config.port}/graphql`,
		);
		console.log(
			`📚 API documentation: http://localhost:${this.config.port}/docs`,
		);
		console.log(
			`🔍 GraphiQL interface: http://localhost:${this.config.port}/graphql`,
		);
		console.log(
			`🗄️ Database: ${mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"}`,
		);
		console.log("=".repeat(50) + "\n");
	}
}
