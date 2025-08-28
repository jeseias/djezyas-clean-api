import { z } from "zod";
import {
	Controller,
	type ControllerRequest,
	type ControllerResponse,
} from "@/src/modules/shared/adapters/http/elysia/controller";
import type { ProcessMcxExpressPaymentUseCase } from "../../../app/use-cases/process-mcx-express-payment/process-mcx-express-payment.use-case";

const McxExpressCallbackSchema = z.object({
	creationDate: z.string().optional(),
	updatedDate: z.string().optional(),
	id: z.string().optional(),
	amount: z.number().optional(),
	clearingPeriod: z.string().optional(),
	transactionNumber: z.string().optional(),
	status: z.enum(["ACCEPTED", "REJECTED"], {
		errorMap: () => ({
			message: "Status must be either 'ACCEPTED' or 'REJECTED'",
		}),
	}),
	transactionType: z.string().optional(),
	orderOrigin: z.string().optional(),
	currency: z.string().optional(),
	reference: z.object({
		id: z.string().min(1, "Reference ID is required"),
	}).optional(),
	pointOfSale: z.object({
		id: z.string(),
	}).optional(),
	merchantReferenceNumber: z.string().min(1, "Merchant reference number is required"),
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
			console.log("==>==>==> McxExpress callback request:", JSON.stringify(request.body, null, 2));
			
			const validatedData = McxExpressCallbackSchema.parse(request.body);
			
			// Use merchantReferenceNumber as the primary reference
			const reference = validatedData.merchantReferenceNumber;

			console.log("==>==>==> Extracted reference:", reference);

			const result = await this.processMcxExpressPaymentUseCase.execute({
				reference,
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
			console.error("Request body:", JSON.stringify(request.body, null, 2));

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
