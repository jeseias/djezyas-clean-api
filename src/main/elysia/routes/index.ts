import { Elysia } from "elysia";
import { productsRoutes } from "@/src/modules/product/adapters/http/elysia/routes/products.routes";
import { errorHandler } from "../plugins/error-handler";

export const routes = new Elysia({ prefix: "/api/v1" })
	.onError(({ ...props }) => errorHandler({ ...props }))
	.use(productsRoutes);
