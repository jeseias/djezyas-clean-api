import { z } from "zod";
import {
	Controller,
	type ControllerRequest,
	type ControllerResponse,
} from "@/src/modules/shared/adapters/http/elysia/controller";
import type { ProcessMcxExpressPaymentUseCase } from "../../../app/use-cases/process-mcx-express-payment/process-mcx-express-payment.use-case";

const McxExpressCallbackSchema = z.object({
	reference: z.string().min(1, "Reference is required"),
	status: z.enum(["ACCEPTED", "REJECTED"], {
		errorMap: () => ({
			message: "Status must be either 'ACCEPTED' or 'REJECTED'",
		}),
	}),
});

export type McxExpressCallbackRequest = z.infer<
	typeof McxExpressCallbackSchema
>;

export type McxExpressCallbackResponse = {
	success: boolean;
	message: string;
	data?: {
		paymentIntentFound: boolean;
		ordersUpdated: boolean;
	};
	error?: string;
};

export class McxExpressController extends Controller<
	McxExpressCallbackRequest,
	unknown,
	unknown,
	unknown,
	McxExpressCallbackResponse
> {
	constructor(
		private readonly processMcxExpressPaymentUseCase: ProcessMcxExpressPaymentUseCase,
	) {
		super(); 
	}

	async execute(
		request: ControllerRequest<McxExpressCallbackRequest>,
	): Promise<ControllerResponse<McxExpressCallbackResponse>> {
		try {
			const validatedData = McxExpressCallbackSchema.parse(request.body);

			const result = await this.processMcxExpressPaymentUseCase.execute({
				reference: validatedData.reference,
				status: validatedData.status,
			});

			return {
				statusCode: 200,
				data: {
					success: true,
					message: "Payment callback processed successfully",
					data: {
						paymentIntentFound: result.paymentIntent !== null,
						ordersUpdated: result.ordersUpdated,
					},
				},
			};
		} catch (error) {
			console.error("McxExpress callback processing error:", error);

			return {
				statusCode: 400,
				data: {
					success: false,
					message: "Failed to process payment callback",
					error: error instanceof Error ? error.message : "Unknown error",
				},
			};
		}
	}
}
