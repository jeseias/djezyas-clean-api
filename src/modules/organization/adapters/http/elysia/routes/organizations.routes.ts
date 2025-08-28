import { Elysia } from "elysia";
import { elysiaControllerAdapter } from "@/src/modules/shared/adapters/http/elysia/elysia-controller-adapter";
import { ImageKitFactory } from "@/src/modules/shared/adapters/storage/image-kit";
import { organizationUseCasesFactory } from "../../../factories";
import { UpdateOrganizationLogoController } from "../controllers/update-organization-logo";

const updateOrganizationLogoController = new UpdateOrganizationLogoController(
	organizationUseCasesFactory.updateOrganizationLogo(),
	ImageKitFactory.create(),
);

export const organizationsRoutes = new Elysia({
	prefix: "/organizations",
}).post("/logo", elysiaControllerAdapter(updateOrganizationLogoController));
