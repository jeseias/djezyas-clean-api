import { jwtManager } from "@/src/modules/shared/adapters/factories/service.factory";
import {
	AuthenticateUser,
	IsUserValidService,
	UserTemplateService,
} from "../../core/app/services";
import {
	sessionMongooseRepository,
	userMongooseRepository,
} from "./repository.factory";

export const userEmailTemplateService = new UserTemplateService();

export const authenticateUser = new AuthenticateUser(
	jwtManager,
	sessionMongooseRepository,
);

export const isUserValidService = new IsUserValidService(
	userMongooseRepository,
);
