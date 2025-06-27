import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: "node",
		include: ["**/*.spec.ts", "**/*.test.ts"],
		exclude: ["**/._*.ts"],
		coverage: {
			provider: "istanbul",
		},
		setupFiles: "./vitest.setup.ts",
		env: loadEnv(process.env.NODE_ENV || "test", process.cwd(), ""),
		silent: false,
	},
});
