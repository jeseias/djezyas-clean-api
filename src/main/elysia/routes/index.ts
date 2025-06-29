import { Elysia } from "elysia";
import { errorHandler } from "../plugins/error-handler";

export const routes = new Elysia({ prefix: "/api/v1" }).onError(
	({ ...props }) => errorHandler({ ...props }),
);
