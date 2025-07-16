import { z } from "zod";
import type { SaveProductUseCase } from "@/src/modules/product/core/app/usecases/save-product/save-product.use-case";
import { Product } from "@/src/modules/product/core/domain/entities";
import {
	Controller,
	type ControllerRequest,
	type ControllerResponse,
	type PreRunner,
} from "@/src/modules/shared/adapters/http/elysia/elysia-controller-adapter";

const schema = z
	.object({
		id: z.string().optional(),
		name: z.string(),
		description: z.string().optional(),
		categoryId: z.string(),
		productTypeId: z.string(),
		status: z.nativeEnum(Product.Status).optional(),
		organizationId: z.string(),
		imageUrl: z.string().optional(),
		sku: z.string().optional(),
		barcode: z.string().optional(),
		weight: z.number().optional(),
		dimensions: z
			.object({
				length: z.number(),
				width: z.number(),
				height: z.number(),
			})
			.optional(),
		meta: z.record(z.any()).optional(),
	})
	.strict();

type CreateProductBody = z.infer<typeof schema>;

const validateProductInput: PreRunner<
	CreateProductBody,
	unknown,
	unknown,
	unknown
> = async (req) => {
	const result = schema.safeParse(req.body);
	if (!result.success) {
		throw {
			statusCode: 400,
			message: "Invalid request body",
			errors: result.error.flatten(),
		};
	}
	req.body = result.data;
};

export class SaveProductController extends Controller<
	CreateProductBody,
	unknown,
	unknown,
	unknown,
	Product.Model
> {
	constructor(private readonly saveProductUseCase: SaveProductUseCase) {
		super({ execute: (params) => saveProductUseCase.execute(params) }, [
			validateProductInput,
		]);
	}

	async execute(
		request: ControllerRequest<CreateProductBody>,
	): Promise<ControllerResponse<Product.Model>> {
		const product = await this.saveProductUseCase.execute({
			...request.body,
			createdById: request.user!.id,
		});

		return {
			statusCode: request.body.id ? 200 : 201,
			data: product,
		};
	}
}
