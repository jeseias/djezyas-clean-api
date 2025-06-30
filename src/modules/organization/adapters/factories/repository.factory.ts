import {
	MongooseOrganizationInvitationRepository,
	MongooseOrganizationMemberRepository,
	MongooseOrganizationRepository,
} from "../db/mongoose/repositories";

export const organizationMongooseRepository =
	new MongooseOrganizationRepository();
export const organizationMemberMongooseRepository =
	new MongooseOrganizationMemberRepository();
export const organizationInvitationMongooseRepository =
	new MongooseOrganizationInvitationRepository();
