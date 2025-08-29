export const orderTypeDefs = `#graphql
  # Order Status Enum
  enum OrderPaymentStatus {
    pending
    paid
    refunded
    failed
  }

  enum OrderFulfillmentStatus {
    new
    picking
    packed
    in_delivery
    delivered
    cancelled
    returned
    failed_delivery
    issues
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
    code: String!
    userId: String!
    organizationId: String!
    organization: OrderOrganization!
    items: [OrderItem!]!
    totalAmount: Float!
    paymentStatus: OrderPaymentStatus!
    fulfillmentStatus: OrderFulfillmentStatus!
    clientConfirmedIsDelivered: Boolean!
    paymentIntentId: String
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
    fulfillmentStatus: [OrderFulfillmentStatus!]
    paymentStatus: [OrderPaymentStatus!]
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
    fulfillmentStatus: OrderFulfillmentStatus
    paymentStatus: OrderPaymentStatus
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
    splitCartIntoOrders(input: SplitCartIntoOrdersInput!): SplitCartIntoOrdersResult!
  }
`;
