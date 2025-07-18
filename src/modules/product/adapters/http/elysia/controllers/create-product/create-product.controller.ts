import type { SaveProductUseCase } from "@/src/modules/product/core/app/usecases/save-product/save-product.use-case";
import type { Product } from "@/src/modules/product/core/domain/entities";
import {
	Controller,
	type ControllerRequest,
	type ControllerResponse,
} from "@/src/modules/shared/adapters/http/elysia/controller";
import type { StorageAdapter } from "@/src/modules/shared/ports/storage-adapter";
import { createSaveProductPreRunners } from "./prerunners";
import type { SaveProductBody } from "./schemas";

export class SaveProductController extends Controller<
	SaveProductBody,
	unknown,
	unknown,
	unknown,
	Product.Model
> {
	constructor(
		private readonly saveProductUseCase: SaveProductUseCase,
		private readonly storage: StorageAdapter,
	) {
		super(createSaveProductPreRunners(storage));
	}

	async execute(
		request: ControllerRequest<SaveProductBody>
	): Promise<ControllerResponse<Product.Model>> {
		const useCaseParams = {
			...request.body,
			createdById: request.user!.id,
			imageUrl: request.body.imageUrl,
		};

		const product = await this.saveProductUseCase.execute(useCaseParams);

		return {
			statusCode: request.body.id ? 200 : 201,
			data: product,
		};
	}
}
