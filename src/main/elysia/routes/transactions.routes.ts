import { Elysia } from "elysia";
import { createProcessMcxExpressPaymentUseCase } from "@/src/modules/transactions/adapters/factories/process-mcx-express-payment.factory";
import { createMcxExpressRoutes } from "@/src/modules/transactions/adapters/http/routes/mcx-express.routes";

const createMockPaymentIntentRepository = () =>
	({
		findById: async () => null,
		findByTransactionId: async () => null,
		findByReference: async () => [],
		findManyByOrderIds: async () => [],
		create: async (data: any) => data,
		update: async (data: any) => data,
		delete: async () => {},
		findManyPending: async () => [],
		findExpiredBefore: async () => [],
	}) as any;

const createMockMarkOrdersAsPaidByTransactionIdUseCase = () =>
	({
		execute: async () => ({ orders: [] }),
	}) as any;

export const transactionsRoutes = new Elysia().use(
	createMcxExpressRoutes(
		createProcessMcxExpressPaymentUseCase(
			createMockPaymentIntentRepository(),
			createMockMarkOrdersAsPaidByTransactionIdUseCase(),
		),
	),
);
