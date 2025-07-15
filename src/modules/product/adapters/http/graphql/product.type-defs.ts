export const productTypeDefs = `#graphql
  scalar JSON
  scalar DateTime
  
	enum ProductStatus {
    active
    inactive
    draft
    deleted
  }

  type Product {
    id: String! 
    name: String! 
    slug: String! 
    description: String
    categoryId: String!
    productTypeId: String!
    status: ProductStatus!
    organizationId: String!
    createdById: String!
    imageUrl: String
    sku: String
    barcode: String
    weight: Float
    dimensions: ProductDimensions
    meta: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Price {
    id: String!
    productId: String!
    currencyId: String!
    amount: Float!
    type: PriceType!
    status: PriceStatus!
    validFrom: DateTime
    validUntil: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductCategory {
    id: String!
    name: String!
    slug: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductType {
    id: String!
    name: String!
    slug: String! 
    description: String
    createdById: String!
    organizationId: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum PriceType {
    regular
    sale
    wholesale
    bulk
  }

  enum PriceStatus {
    active
    inactive
    expired
  }

  type ProductDimensions {
    length: Float
    width: Float
    height: Float
  }

  input AddPriceInput {
    productId: String!
    currencyId: String!
    amount: Float!
    type: PriceType
    status: PriceStatus
    validFrom: DateTime
    validUntil: DateTime
  }

  input CreateProductCategoryInput {
    name: String! 
    description: String
  }

  input ProductDimensionsInput {
    length: Float
    width: Float
    height: Float
  }

  input SaveProductInput {
    id: String
    name: String!
    description: String
    categoryId: String!
    productTypeId: String!
    status: ProductStatus
    imageUrl: String
    sku: String
    barcode: String
    weight: Float
    dimensions: ProductDimensionsInput
    meta: JSON
  }

  input SaveProductTypeInput {
    id: String
    name: String!
    description: String
    organizationId: String!
  }

  input CreateProductTypeInput {
    name: String!
    description: String
    organizationId: String!
  }

  input ProductFiltersInput {
    status: ProductStatus
    categoryId: String
    productTypeId: String
    search: String
    hasSku: Boolean
    hasBarcode: Boolean
    hasImage: Boolean
    createdAfter: DateTime
    createdBefore: DateTime
    updatedAfter: DateTime
    updatedBefore: DateTime
    limit: Int
    page: Int
    sortBy: String
    sortOrder: String
  }

  input FindProductByOrganizationInput {
    organizationId: String!
    filters: ProductFiltersInput
  }

  type FindProductByOrganizationResult {
    items: [Product]!
    totalItems: Int!
  }

  input ListProductCategoriesInput {
    page: Int
    limit: Int
    sort: String
    order: String
    search: String
  }

  type ListProductCategoriesResult {
    items: [ProductCategory]!
    totalItems: Int!
  }

  input ListProductTypesInput {
    organizationId: String!
    page: Int
    limit: Int
    sort: String
    order: String
    search: String
  }

  type ListProductTypesResult {
    items: [ProductType]!
    totalItems: Int!
  }

  input GetProductByIdInput {
    productId: String!
  }

  input LoadPricesByProductIdInput {
    productId: String!
  }

  input UpdateProductStatusInput {
    productId: String!
    status: ProductStatus!
  }

  input UpdatePriceAmountInput {
    priceId: String!
    amount: Float!
  }

  input UpdatePriceStatusInput {
    priceId: String!
    status: PriceStatus!
  }

  type Query {
    findProductByOrganization(input: FindProductByOrganizationInput!): FindProductByOrganizationResult!
    getProductById(input: GetProductByIdInput!): Product!
    loadPricesByProductId(input: LoadPricesByProductIdInput!): [Price]!
    listProductCategories(input: ListProductCategoriesInput!): ListProductCategoriesResult!
    listProductTypes(input: ListProductTypesInput!): ListProductTypesResult!
  }

  type Mutation {
    addPrice(input: AddPriceInput!): Price!
    createProductCategory(input: CreateProductCategoryInput!): ProductCategory!
    createProductType(input: CreateProductTypeInput!): ProductType!
    saveProduct(input: SaveProductInput!): Product!
    saveProductType(input: SaveProductTypeInput!): ProductType!
    updatePriceAmount(input: UpdatePriceAmountInput!): Price!
    updatePriceStatus(input: UpdatePriceStatusInput!): Price!
    updateProductStatus(input: UpdateProductStatusInput!): Product!
  }

    
`;
