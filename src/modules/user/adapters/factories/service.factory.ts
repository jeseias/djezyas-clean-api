import { jwtManager } from "@/src/modules/shared/adapters/factories/service.factory";
import { AuthenticateUser, UserTemplateService } from "../../core/app/services";
import { sessionMongooseRepository } from "./repository.factory";

export const userEmailTemplateService = new UserTemplateService();

export const authenticateUser = new AuthenticateUser(
	jwtManager,
	sessionMongooseRepository,
);
