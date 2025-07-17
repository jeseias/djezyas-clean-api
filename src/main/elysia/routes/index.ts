import { Elysia } from "elysia";
import { errorHandler } from "../plugins/error-handler";
import { productsRoutes } from "@/src/modules/product/adapters/http/elysia/routes/products.routes";

export const routes = new Elysia({ prefix: "/api/v1" })
	.onError(({ ...props }) => errorHandler({ ...props }))
	.use(productsRoutes);
