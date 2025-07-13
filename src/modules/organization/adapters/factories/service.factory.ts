import { IsOrganizationValidService } from "../../core/app/services";
import { OrganizationTemplateService } from "../../core/app/services/template-service";
import { organizationMongooseRepository } from "./repository.factory";

export const organizationTemplateService = new OrganizationTemplateService();
export const isOrganizationValidService = new IsOrganizationValidService(
	organizationMongooseRepository,
);
