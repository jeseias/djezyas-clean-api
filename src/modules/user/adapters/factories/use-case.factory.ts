import { jwtManager } from "@/src/modules/shared/adapters/factories/service.factory";
import { VerifyTokenUseCase } from "../../core/app/usecases/verify-token/verify-token.use-case";

export const verifyTokenUseCase = new VerifyTokenUseCase(jwtManager);
