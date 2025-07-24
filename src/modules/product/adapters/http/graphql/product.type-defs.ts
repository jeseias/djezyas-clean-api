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
    price: Price
  }

  type B2CProductPrice {
    currency: String!
    unitAmount: Float!
    type: PriceType
    status: PriceStatus
    validFrom: DateTime
    validUntil: DateTime
  }

  type B2CProduct {
    slug: String!
    name: String!
    description: String
    imageUrl: String
    weight: Float
    price: B2CProductPrice
    dimensions: ProductDimensions
    category: B2CCategory!
    productType: B2CProductType!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type B2CCategory {
    slug: String!
    name: String!
  }

  type B2CProductType {
    slug: String!
    name: String!
  }

  type Price {
    id: String!
    productId: String!
    unitAmount: Float!
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

  input SaveProductPriceInput {
    currency: String!
    unitAmount: Float!
    type: PriceType
    status: PriceStatus
    validFrom: DateTime
    validUntil: DateTime
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
    price: SaveProductPriceInput
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

  input B2CProductFiltersInput {
    storeSlug: String
    categoryId: String
    productTypeId: String
    search: String
    minPrice: Float
    maxPrice: Float
    currency: String
    limit: Int
    page: Int
    sortBy: String
    sortOrder: String
  }

  input FindProductByOrganizationInput {
    organizationId: String!
    filters: ProductFiltersInput
  }

  input ListB2CProductsInput {
    filters: B2CProductFiltersInput
  }

  type FindProductByOrganizationResult {
    items: [Product]!
    totalItems: Int!
  }

  type ListB2CProductsResult {
    items: [B2CProduct]!
    totalItems: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
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
    listB2CProducts(input: ListB2CProductsInput!): ListB2CProductsResult!
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
