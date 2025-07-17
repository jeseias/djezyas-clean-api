import { Elysia } from "elysia";
import { _env } from "@/src/main/config/_env";
import { elysiaControllerAdapter } from "@/src/modules/shared/adapters/http/elysia/elysia-controller-adapter";
import { LocalStorageAdapter } from "@/src/modules/shared/adapters/storage/local-storage-adapter";
import { productUseCasesFactory } from "../../../factories/use-cases.factory";
import { SaveProductController } from "../controllers/create-product";

const saveProductController = new SaveProductController(
	productUseCasesFactory.saveProduct(),
	new LocalStorageAdapter(_env.SERVER_URL!),
);

export const productsRoutes = new Elysia({ prefix: "/products" }).post(
	"/",
	elysiaControllerAdapter(saveProductController),
);
