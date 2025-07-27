import { Elysia } from "elysia";
import { elysiaControllerAdapter } from "@/src/modules/shared/adapters/http/elysia/elysia-controller-adapter";
import { ImageKitFactory } from "@/src/modules/shared/adapters/storage/image-kit";
import { productUseCasesFactory } from "../../../factories/use-cases.factory";
import { SaveProductController } from "../controllers/create-product";

const saveProductController = new SaveProductController(
	productUseCasesFactory.saveProduct(),
	ImageKitFactory.create(),
);

export const productsRoutes = new Elysia({ prefix: "/products" }).post(
	"/",
	elysiaControllerAdapter(saveProductController),
);
