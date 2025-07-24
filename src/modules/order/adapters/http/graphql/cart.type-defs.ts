export const cartTypeDefs = `#graphql
  type CartItem {
    productId: String!
    quantity: Int!
    product: CartProduct
  }

  type CartProduct {
    slug: String!
    name: String!
    imageUrl: String
    price: CartProductPrice!
  }

  type CartProductPrice {
    currency: String!
    unitAmount: Int!
  }

  type Cart {
    id: String!
    userId: String!
    items: [CartItem!]!
    itemCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CartSummary {
    itemCount: Int!
    totalPrice: CartTotalPrice!
  }

  type CartTotalPrice {
    currency: String!
    value: Float!
  }

  type CartValidationResult {
    isValid: Boolean!
    issues: [String!]!
  }

  input AddToCartInput {
    productId: String!
    quantity: Int!
  }

  input UpdateItemQuantityInput {
    productId: String!
    quantity: Int!
  }

  input RemoveItemInput {
    productId: String!
  }

  type AddToCartResponse {
    id: String!
    itemCount: Int!
  }

  type UpdateItemQuantityResponse {
    id: String!
    itemCount: Int!
  }

  type RemoveItemResponse {
    id: String!
    itemCount: Int!
  }

  type ClearCartResponse {
    id: String!
  }

  type Query {
    cart: Cart!
    cartSummary: CartSummary!
    validateCart: CartValidationResult!
  }

  type Mutation {
    addToCart(input: AddToCartInput!): AddToCartResponse!
    updateItemQuantity(input: UpdateItemQuantityInput!): UpdateItemQuantityResponse!
    removeItem(input: RemoveItemInput!): RemoveItemResponse!
    clearCart: ClearCartResponse!
  }
`;
