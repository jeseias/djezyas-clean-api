import { Elysia } from "elysia";
import { orderUseCasesFactory } from "@/src/modules/order/adapters/factories/orders.use-cases-factory";
import { createProcessMcxExpressPaymentUseCase } from "@/src/modules/transactions/adapters/factories/process-mcx-express-payment.factory";
import { paymentIntentMongooseRepository } from "@/src/modules/transactions/adapters/factories/repository.factory";
import { createMcxExpressRoutes } from "@/src/modules/transactions/adapters/http/routes/mcx-express.routes";

export const transactionsRoutes = new Elysia().use(
	createMcxExpressRoutes(
		createProcessMcxExpressPaymentUseCase(
			paymentIntentMongooseRepository,
			orderUseCasesFactory.markOrdersAsPaidByPaymentIntentId(),
		),
	),
);
