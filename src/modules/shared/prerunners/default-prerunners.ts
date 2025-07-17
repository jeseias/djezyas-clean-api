import type {
	DefaultPreRunnersKeys,
	PreRunner,
} from "../adapters/http/elysia/pre-runners";
import { authPreRunner } from "./auth.pre-runner";

export const DefaultPreRunners: Record<
	DefaultPreRunnersKeys,
	PreRunner<unknown, unknown, unknown, unknown>
> = {
	auth: authPreRunner,
};
