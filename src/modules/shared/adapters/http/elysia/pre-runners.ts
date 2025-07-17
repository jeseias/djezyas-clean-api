import type { ControllerRequest } from ".";

export type PreRunner<Body, Query, Params, Headers> = (
	req: ControllerRequest<Body, Query, Params, Headers>,
) => Promise<void>;

export type DefaultPreRunnersKeys = "auth";

export type PreRunnerOrKey<Body, Query, Params, Headers> =
	| DefaultPreRunnersKeys
	| PreRunner<Body, Query, Params, Headers>;
