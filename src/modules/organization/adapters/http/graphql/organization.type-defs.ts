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
  type OrganizationLocation {
    address: String!
    city: String!
    state: String
    country: String!
    postalCode: String
    latitude: Float!
    longitude: Float!
  }

  type Organization {
    id: String!
    name: String!
    slug: String!
    ownerId: String!
    status: OrganizationStatus
    plan: OrganizationPlanType
    logoUrl: String
    location: OrganizationLocation
    settings: JSON
    meta: JSON
    createdAt: String!
    updatedAt: String!
  }

  type Store {
    slug: String!
    name: String!
    logoUrl: String
    location: OrganizationLocation
    createdAt: DateTime!
  }

  type OrganizationSummary {
    id: String!
    name: String!
    slug: String!
    logoUrl: String
    location: OrganizationLocation
    plan: OrganizationPlanType
    status: OrganizationStatus
    createdAt: String!
  }

  type OrganizationMember {
    id: String!
    organizationId: String!
    userId: String!
    role: OrganizationMemberRole!
    invitedAt: String!
    joinedAt: String
    user: OrganizationMemberUser!
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

  type PendingInvitationWithUser {
    id: String!
    organizationId: String!
    email: String!
    role: OrganizationInvitationRole!
    token: String!
    invitedAt: String!
    acceptedAt: String
    status: OrganizationInvitationStatus!
    user: OrganizationMemberUser
  }

  type CreateOrganizationResult {
    organization: Organization!
  }

  type GetOrganizationMembersResult {
    members: [OrganizationMember!]!
    pendingInvitations: [PendingInvitationWithUser]!
  }

  type InviteMemberResult {
    invitation: OrganizationInvitation!
    isRegistered: Boolean!
    inviteLink: String!
    isResent: Boolean!
  }

  type OrganizationSummary {
    id: String!
    name: String!
    slug: String!
    logoUrl: String
    plan: OrganizationPlanType
  }

  type LoadMyOrganizationsResult {
    organizations: [OrganizationSummary!]!
  }

  type InvitationSummary {
    id: String!
    organizationId: String!
    organization: OrganizationSummary!
    email: String!
    role: OrganizationInvitationRole!
    token: String!
    invitedAt: String!
    acceptedAt: String
    status: OrganizationInvitationStatus!
  }

  type LoadMyInvitationsResult {
    invitations: [InvitationSummary!]!
  }

  type AcceptInvitationResult {
    message: String!
  }

  type UpdateOrganizationResult {
    organization: Organization!
  }

  input OrganizationLocationInput {
    address: String!
    city: String!
    state: String
    country: String!
    postalCode: String
    latitude: Float!
    longitude: Float!
  }

  input CreateOrganizationInput {
    name: String!
    logoUrl: String
    location: OrganizationLocationInput
    settings: JSON
    meta: JSON
  }

  input UpdateOrganizationInput {
    organizationId: String!
    name: String
    description: String
    location: OrganizationLocationInput
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

  input ListStoresInput {
    page: Int
    limit: Int
    search: String
  }

  type ListStoresResult {
    stores: [Store]!
    total: Int!
    page: Int!
    limit: Int!
  }

  type Query {
    getOrganizationMembers(input: GetOrganizationMembersInput!): GetOrganizationMembersResult!
    loadMyOrganizations: LoadMyOrganizationsResult!
    loadMyInvitations: LoadMyInvitationsResult!
    listStores(input: ListStoresInput!): ListStoresResult!
  }

  type Mutation {
    createOrganization(input: CreateOrganizationInput!): CreateOrganizationResult!
    updateOrganization(input: UpdateOrganizationInput!): UpdateOrganizationResult!
    inviteMember(input: InviteMemberInput!): InviteMemberResult!
    acceptInvitation(input: AcceptInvitationInput!): AcceptInvitationResult!
  }
`;
