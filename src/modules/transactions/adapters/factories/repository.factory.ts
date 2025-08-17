import type { PaymentIntentRepository } from "../../domain/repositories/payment-intent.repository";
import { MongoosePaymentIntentRepository } from "../db/mongoose/repositories/payment-intent.repository";

export const paymentIntentMongooseRepository: PaymentIntentRepository =
	new MongoosePaymentIntentRepository();
