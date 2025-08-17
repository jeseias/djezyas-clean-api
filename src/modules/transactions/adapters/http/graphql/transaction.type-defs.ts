export const transactionTypeDefs = `#graphql
  enum PaymentIntentStatus {
    pending
    succeeded
    failed
    expired
    cancelled
  }

  enum PaymentProvider {
    multicaixa_express
    stripe
    afrimoney
  }

  type PaymentIntent {
    id: String!
    userId: String!
    orderIds: [String!]!
    amount: Float!
    provider: PaymentProvider!
    status: PaymentIntentStatus!
    transactionId: String
    expiresAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CheckoutSession {
    paymentIntentId: String!
    status: PaymentIntentStatus!
    expiresAt: DateTime
    provider: PaymentProvider!
    totalAmount: Float!
    orders: [Order!]!
    transactionId: String
  }

  input CreatePaymentIntentInput {
    orderIds: [String!]!
    provider: PaymentProvider!
  }

  type CreatePaymentIntentResponse {
    token: String!
  }

  type Query {
    # paymentIntent(id: String!): PaymentIntent
    checkoutSession(token: String!): CheckoutSession!
  }

  type Mutation {
    createPaymentIntent(input: CreatePaymentIntentInput!): CreatePaymentIntentResponse!
  }
`;
