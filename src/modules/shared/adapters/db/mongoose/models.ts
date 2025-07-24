import { ModelValidator } from "./model-validator";

// Centralized model registration to prevent duplicate schema issues
// This file ensures all models are registered in the correct order

export {
	type OrderDocument,
	OrderModel,
} from "../../../../order/adapters/db/mongoose/models/order-model";
export {
	type OrganizationInvitationDocument,
	OrganizationInvitationModel,
} from "../../../../organization/adapters/db/mongoose/organization-invitation-model";
export {
	type OrganizationMemberDocument,
	OrganizationMemberModel,
} from "../../../../organization/adapters/db/mongoose/organization-member-model";
// Organization module models
export {
	type OrganizationDocument,
	OrganizationModel,
} from "../../../../organization/adapters/db/mongoose/organization-model";
export {
	type PriceDocument,
	PriceModel,
} from "../../../../product/adapters/db/mongoose/price-model";
export {
	type ProductCategoryDocument,
	ProductCategoryModel,
} from "../../../../product/adapters/db/mongoose/product-category-model";
// Product module models
export {
	type ProductDocument,
	ProductModel,
} from "../../../../product/adapters/db/mongoose/product-model";
export {
	type ProductTypeDocument,
	ProductTypeModel,
} from "../../../../product/adapters/db/mongoose/product-type-model";
export {
	type SessionDocument,
	SessionModel,
} from "../../../../user/adapters/db/mongoose/session-model";
export {
	type UserDocument,
	UserModel,
} from "../../../../user/adapters/db/mongoose/user-model";

const EXPECTED_MODELS = [
	"User",
	"Session",
	"Organization",
	"OrganizationInvitation",
	"OrganizationMember",
	"Product",
	"ProductCategory",
	"ProductType",
	"Price",
	"Order",
];

export function registerAllModels(): void {
	const validation = ModelValidator.validateModelRegistration(EXPECTED_MODELS);

	if (!validation.isValid) {
		console.warn("⚠️ Model registration validation failed:");
		if (validation.missing.length > 0) {
			console.warn(`  Missing models: ${validation.missing.join(", ")}`);
		}
		if (validation.extra.length > 0) {
			console.warn(`  Extra models: ${validation.extra.join(", ")}`);
		}
	}

	const duplicateCheck = ModelValidator.checkForDuplicateIssues();
	if (duplicateCheck.hasIssues) {
		console.warn("⚠️ Potential duplicate schema issues detected:");
		duplicateCheck.issues.forEach((issue) => console.warn(`  - ${issue}`));
	}

	ModelValidator.logModelStatus();

	console.log("✅ All mongoose models registered successfully");
}
