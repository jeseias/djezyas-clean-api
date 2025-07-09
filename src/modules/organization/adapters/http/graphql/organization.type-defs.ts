export const organizationTypeDefs = `#graphql
  # Enums
  enum OrganizationStatus {
    active
    disabled
    pending
  }

  enum OrganizationPlanType {
    free
    pro
    enterprise
  }

  enum OrganizationMemberRole {
    owner
    admin
    member
  }

  enum OrganizationInvitationRole {
    admin
    member
  }

  enum OrganizationInvitationStatus {
    pending
    accepted
    expired
  }

  # Types
  type Organization {
    id: String!
    name: String!
    slug: String!
    ownerId: String!
    status: OrganizationStatus
    plan: OrganizationPlanType
    logoUrl: String
    settings: JSON
    meta: JSON
    createdAt: String!
    updatedAt: String!
  }

  type OrganizationMember {
    id: String!
    organizationId: String!
    userId: String!
    role: OrganizationMemberRole!
    invitedAt: String!
    joinedAt: String
    user: OrganizationMemberUser
  }

  type OrganizationMemberUser {
    name: String!
    avatar: String
    email: String!
  }

  type OrganizationInvitation {
    id: String!
    organizationId: String!
    email: String!
    role: OrganizationInvitationRole!
    token: String!
    invitedAt: String!
    acceptedAt: String
    status: OrganizationInvitationStatus!
  }

  type CreateOrganizationResult {
    organization: Organization!
  }

  type GetOrganizationMembersResult {
    members: [OrganizationMember!]!
    pendingInvitations: [OrganizationInvitation!]!
  }

  type InviteMemberResult {
    invitation: OrganizationInvitation!
    isRegistered: Boolean!
    inviteLink: String!
  }

  type OrganizationSummary {
    id: String!
    name: String!
    slug: String!
    logoUrl: String
  }

  type LoadMyOrganizationsResult {
    organizations: [OrganizationSummary!]!
  }

  type AcceptInvitationResult {
    message: String!
  }

  # Inputs
  input CreateOrganizationInput {
    name: String!
    slug: String!
    ownerId: String!
    plan: OrganizationPlanType
    logoUrl: String
    settings: JSON
    meta: JSON
  }

  input AcceptInvitationInput {
    token: String!
  }

  input GetOrganizationMembersInput {
    organizationId: String!
  }

  input InviteMemberInput {
    organizationId: String!
    email: String!
    role: OrganizationInvitationRole!
  }

  type Query {
    getOrganizationMembers(input: GetOrganizationMembersInput!): GetOrganizationMembersResult!
    loadMyOrganizations: LoadMyOrganizationsResult!
  }

  type Mutation {
    createOrganization(input: CreateOrganizationInput!): CreateOrganizationResult!
    inviteMember(input: InviteMemberInput!): InviteMemberResult!
    acceptInvitation(input: AcceptInvitationInput!): AcceptInvitationResult!
  }
`;
