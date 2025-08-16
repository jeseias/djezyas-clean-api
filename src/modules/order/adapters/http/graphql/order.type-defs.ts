export const orderTypeDefs = `#graphql
  # Order Status Enum
  enum OrderStatus {
    pending
    paid
    in_delivery
    client_confirmed_delivery
    cancelled
    expired
  }

  # Order Grouping Enum
  enum OrderGrouping {
    date
    status
  }

  type OrderItemPrice {
    id: String! 
    currency: String!
    unitAmount: Float!
  }

  type OrderItemProduct {
    id: String!
    imageUrl: String! 
    name: String!
    slug: String!
    description: String!
  }

  type OrderOrganization {
    id: String!
    name: String!
    slug: String!
    logoUrl: String
  }

  # Order Item Type
  type OrderItem {
    priceId: String!
    productId: String!
    name: String!
    quantity: Int!
    unitAmount: Float!
    subtotal: Float!
    product: OrderItemProduct
    price: OrderItemPrice
  }

  # Order Type
  type Order {
    id: String!
    userId: String!
    organizationId: String!
    organization: OrderOrganization!
    items: [OrderItem!]!
    totalAmount: Float!
    status: OrderStatus!
    paymentIntentId: String
    transactionId: String
    paidAt: DateTime
    inDeliveryAt: DateTime
    clientConfirmedDeliveryAt: DateTime
    expiredAt: DateTime
    cancelledAt: DateTime
    meta: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }



  # Calculate Order Totals Input
  input CalculateOrderTotalsItemInput {
    productId: String!
    unitAmount: Float!
    quantity: Int!
  }

  input CalculateOrderTotalsInput {
    items: [CalculateOrderTotalsItemInput!]!
  }

  # Calculate Order Totals Breakdown Item
  type OrderTotalsBreakdownItem {
    productId: String!
    quantity: Int!
    unitAmount: Float!
    subtotal: Float!
  }

  # Calculate Order Totals Result
  type CalculateOrderTotalsResult {
    subtotal: Float!
    platformFee: Float!
    providerFee: Float!
    total: Float!
    breakdownPerItem: [OrderTotalsBreakdownItem!]!
  }

  # Cancel Order Input
  input CancelOrderInput {
    userId: String!
    orderId: String!
    reason: String
  }

  # Cancel Order Result
  type CancelOrderResult {
    order: Order!
  }

  # Create Orders From Cart Input
  input CreateOrdersFromCartInput {
    userId: String!
    productIds: [String!]
    meta: JSON
  }

  # Create Orders From Cart Result
  type CreateOrdersFromCartResult {
    orders: [Order!]!
  }

  # Expire Order Input
  input ExpireOrderInput {
    userId: String!
    orderId: String!
  }

  # Expire Order Result
  type ExpireOrderResult {
    order: Order!
  }

  # Filter Orders By Status Input
  input FilterOrdersByStatusInput {
    userId: String!
    organizationId: String!
    status: [OrderStatus!]
    fromDate: DateTime
    toDate: DateTime
    page: Int
    limit: Int
  }

  # Filter Orders By Status Result
  type FilterOrdersByStatusResult {
    orders: [Order!]!
    totalItems: Int!
  }

  # Get Order By ID Input
  input GetOrderByIdInput {
    orderId: String!
    userId: String
    organizationId: String
  }

  # Get Order By ID Result
  type GetOrderByIdResult {
    order: Order!
  }

  # Get Orders By Organization Input
  input GetOrdersByOrganizationInput {
    userId: String!
    organizationId: String!
    filters: OrderFiltersInput
    groupBy: OrderGrouping
  }

  # Order Filters Input
  input OrderFiltersInput {
    limit: Int
    page: Int
    sortBy: String
    sortOrder: String
    status: OrderStatus
    createdAfter: DateTime
    createdBefore: DateTime
  }

  # Grouped Orders Type
  type GroupedOrders {
    key: String!
    orders: [Order!]!
  }

  # Get Orders By Organization Result
  type GetOrdersByOrganizationResult {
    orders: [Order!]!
    totalItems: Int!
    groupedOrders: [GroupedOrders!]
  }

  # Get Orders By User Input
  input GetOrdersByUserInput {
    userId: String!
    filters: OrderFiltersInput
    groupBy: OrderGrouping
  }

  # Get Orders By User Result
  type GetOrdersByUserResult {
    orders: [Order!]!
    totalItems: Int!
    groupedOrders: [GroupedOrders!]
  }

  # Mark Order As Paid Input
  input MarkOrderAsPaidInput {
    userId: String!
    orderIds: [String!]!
    transactionId: String
  }

  # Mark Order As Paid Result
  type MarkOrderAsPaidResult {
    orders: [Order!]!
  }

  # Mark Orders As Paid By Transaction ID Input
  input MarkOrdersAsPaidByTransactionIdInput {
    transactionId: String!
  }

  # Mark Orders As Paid By Transaction ID Result
  type MarkOrdersAsPaidByTransactionIdResult {
    orders: [Order!]!
  }

  # Split Cart Into Orders Input
  input SplitCartIntoOrdersInput {
    cartItems: [CartItemInput!]!
    products: [ProductInput!]!
  }

  # Cart Item Input
  input CartItemInput {
    productId: String!
    quantity: Int!
  }

  # Product Input (simplified for cart splitting)
  input ProductInput {
    id: String!
    organizationId: String!
    name: String!
  }

  # Split Cart Into Orders Result
  type SplitCartIntoOrdersResult {
    ordersByOrganization: JSON!
  }

  # Queries
  type Query {
    calculateOrderTotals(input: CalculateOrderTotalsInput!): CalculateOrderTotalsResult!
    getOrderById(input: GetOrderByIdInput!): GetOrderByIdResult!
    getOrdersByUser(input: GetOrdersByUserInput!): GetOrdersByUserResult!
    getOrdersByOrganization(input: GetOrdersByOrganizationInput!): GetOrdersByOrganizationResult!
    filterOrdersByStatus(input: FilterOrdersByStatusInput!): FilterOrdersByStatusResult!
  }

  # Mutations
  type Mutation {
    cancelOrder(input: CancelOrderInput!): CancelOrderResult!
    createOrdersFromCart(input: CreateOrdersFromCartInput!): CreateOrdersFromCartResult!
    expireOrder(input: ExpireOrderInput!): ExpireOrderResult!
    markOrderAsPaid(input: MarkOrderAsPaidInput!): MarkOrderAsPaidResult!
    markOrdersAsPaidByTransactionId(input: MarkOrdersAsPaidByTransactionIdInput!): MarkOrdersAsPaidByTransactionIdResult!
    splitCartIntoOrders(input: SplitCartIntoOrdersInput!): SplitCartIntoOrdersResult!
  }
`;
