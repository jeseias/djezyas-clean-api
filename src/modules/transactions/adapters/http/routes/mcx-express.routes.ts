import { Elysia } from "elysia";
import { elysiaControllerAdapter } from "@/src/modules/shared/adapters/http/elysia/elysia-controller-adapter";
import type { ProcessMcxExpressPaymentUseCase } from "../../../app/use-cases/process-mcx-express-payment/process-mcx-express-payment.use-case";
import { McxExpressController } from "../controllers/mcx-express.controller";

export const createMcxExpressRoutes = (
	processMcxExpressPaymentUseCase: ProcessMcxExpressPaymentUseCase,
) => {
	const controller = new McxExpressController(processMcxExpressPaymentUseCase);

	return new Elysia({ prefix: "/api/public/payments/mcx-express" }).post(
		"/callback",
		elysiaControllerAdapter(controller),
	);
};
