import {
	IsOrganizationMemberService,
	IsOrganizationValidService,
} from "../../core/app/services";
import { OrganizationTemplateService } from "../../core/app/services/template-service";
import {
	organizationMemberMongooseRepository,
	organizationMongooseRepository,
} from "./repository.factory";

export const organizationTemplateService = new OrganizationTemplateService();
export const isOrganizationValidService = new IsOrganizationValidService(
	organizationMongooseRepository,
);
export const isOrganizationMemberService = new IsOrganizationMemberService(
	organizationMemberMongooseRepository,
);
