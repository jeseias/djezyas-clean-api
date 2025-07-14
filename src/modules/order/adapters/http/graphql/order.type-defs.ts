export const orderTypeDefs = `#graphql
 
  enum OrderStatus {
    pending
    paid
    cancelled
    expired
  }

  type OrderItem {
    productId: String!
    priceId: String!
    name: String!
    quantity: Int!
    unitAmount: Float!
    subtotal: Float!
    product: Product
    price: Price
  }

  type Order {
    id: String!
    userId: String!
    organizationId: String!
    items: [OrderItem!]!
    totalAmount: Float!
    status: OrderStatus!
    meta: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateOrderItemInput {
    priceId: String!
    quantity: Int!
  }

  input CreateOrderInput {
    organizationId: String!
    items: [CreateOrderItemInput!]!
    meta: JSON
  }

  input OrderFiltersInput {
    status: OrderStatus
    search: String
    minAmount: Float
    maxAmount: Float
    hasItems: Boolean
    createdAfter: DateTime
    createdBefore: DateTime
    updatedAfter: DateTime
    updatedBefore: DateTime
    limit: Int
    page: Int
    sortBy: String
    sortOrder: String
  }

  input FindOrdersByOrganizationInput {
    organizationId: String!
    filters: OrderFiltersInput
  }

  input FindOrdersByUserInput {
    userId: String!
    filters: OrderFiltersInput
  }

  type FindOrdersResult {
    items: [Order]!
    totalItems: Int!
  }

  type Query {
    findOrdersByOrganization(input: FindOrdersByOrganizationInput!): FindOrdersResult!
    findOrdersByUser(input: FindOrdersByUserInput!): FindOrdersResult!
  }

  input UpdateOrderStatusInput {
    orderId: String!
    status: OrderStatus!
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(input: UpdateOrderStatusInput!): Order!
  }
`;
