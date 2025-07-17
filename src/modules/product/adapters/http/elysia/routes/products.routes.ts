import { Elysia } from "elysia";
import { elysiaControllerAdapter } from "@/src/modules/shared/adapters/http/elysia/elysia-controller-adapter";
import { SaveProductController } from "../controllers/create-product";
import { productUseCasesFactory } from "../../../factories/use-cases.factory";
import { LocalStorageAdapter } from "@/src/modules/shared/adapters/storage/local-storage-adapter";
import { _env } from "@/src/main/config/_env";

const saveProductController = new SaveProductController(
	productUseCasesFactory.saveProduct(),
	new LocalStorageAdapter(_env.SERVER_URL!)
);

export const productsRoutes = new Elysia({ prefix: "/products" })
	.post(
		"/",
		elysiaControllerAdapter(saveProductController),
	);
