import type { PreRunner } from "../adapters/http/elysia";
import { authPreRunner } from "./auth.pre-runner";

export const DefaultPreRunners: Record<string, PreRunner<any, any, any, any>> = {
	auth: authPreRunner,
};