export const userTypeDefs = `#graphql
  # Enums
  enum UserStatus {
    active
    inactive
    pending
    blocked
  }

  enum UserRole {
    admin
    user
  }

  enum DeviceType {
    mobile
    desktop
    tablet
  }

  # Types
  type User {
    id: String!
    name: String!
    email: String!
    username: String!
    phone: String!
    bio: String
    avatar: String
    status: UserStatus!
    role: UserRole!
    emailVerifiedAt: String
    createdAt: String!
    updatedAt: String!
  }

  type Session {
    id: String!
    userId: String!
    accessTokenExpiresAt: String!
    refreshTokenExpiresAt: String!
    deviceInfo: DeviceInfo!
    isActive: Boolean!
    createdAt: String!
    lastUsedAt: String!
  }

  type DeviceInfo {
    userAgent: String!
    ipAddress: String!
    deviceType: DeviceType
    browser: String
    os: String
  }

  type Tokens {
    accessToken: String!
    refreshToken: String!
    accessTokenExpiresIn: String!
    refreshTokenExpiresIn: String!
  }

  type LoginResult {
    user: User!
    session: Session!
    tokens: Tokens!
    message: String!
  }

  type RegisterResult {
    user: User!
  }

  type VerifyEmailResult {
    user: User!
    message: String!
  }

  type ForgotPasswordResult {
    message: String!
    expiresIn: String!
  }

  type ResetPasswordResult {
    message: String!
  }

  type ResendVerificationResult {
    message: String!
    expiresIn: String!
  }

  type VerifyTokenResult {
    userId: String!
    email: String!
    username: String!
    role: UserRole!
  }

  type LogoutResult {
    message: String!
  }

  type RefreshTokenResult {
    user: User!
    session: Session!
    tokens: Tokens!
    message: String!
  }

  # Inputs
  input RegisterUserInput {
    email: String!
    username: String!
    phone: String!
    name: String!
    password: String!
    avatar: String
  }

  input LoginInput {
    email: String!
    password: String!
    deviceInfo: DeviceInfoInput!
  }

  input DeviceInfoInput {
    userAgent: String!
    deviceType: DeviceType
    browser: String
    os: String
  }

  input VerifyEmailInput {
    email: String!
    verificationCode: String!
  }

  input ForgotPasswordInput {
    email: String!
  }

  input ResetPasswordInput {
    token: String!
    newPassword: String!
  }

  input ResendVerificationInput {
    email: String!
  }

  input VerifyTokenInput {
    token: String!
  }

  input RefreshTokenInput {
    refreshToken: String!
    deviceInfo: DeviceInfoInput!
  }

  type Query {
    me: User
  }

  type Mutation {
    registerUser(input: RegisterUserInput!): User!
    login(input: LoginInput!): LoginResult!
    verifyEmail(input: VerifyEmailInput!): VerifyEmailResult!
    forgotPassword(input: ForgotPasswordInput!): ForgotPasswordResult!
    resetPassword(input: ResetPasswordInput!): ResetPasswordResult!
    resendVerification(input: ResendVerificationInput!): ResendVerificationResult!
    logout: LogoutResult!
    refreshToken(input: RefreshTokenInput!): RefreshTokenResult!
  }
`;
