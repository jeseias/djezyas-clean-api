export const productTypeDefs = `#graphql
	enum ProductStatus {
		ACTIVE
		INACTIVE
		DRAFT
		ARCHIVED
	}

	enum PriceType {
		REGULAR
		SALE
		WHOLESALE
		BULK
	}

	enum PriceStatus {
		ACTIVE
		INACTIVE
		EXPIRED
	}

	enum CurrencyStatus {
		ACTIVE
		INACTIVE
	}

	type ProductDimensions {
		length: Float!
		width: Float!
		height: Float!
	}

	type Product {
		id: ID!
		name: String!
		slug: String!
		description: String
		categoryId: ID!
		productTypeId: ID!
		status: ProductStatus!
		organizationId: ID!
		createdById: ID!
		imageUrl: String
		sku: String
		barcode: String
		weight: Float
		dimensions: ProductDimensions
		meta: JSON
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	type ProductCategory {
		id: ID!
		name: String!
		slug: String!
		description: String
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	type ProductType {
		id: ID!
		name: String!
		slug: String!
		description: String
		organizationId: ID!
		createdById: ID!
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	type Price {
		id: ID!
		productId: ID!
		currencyId: ID!
		amount: Float!
		type: PriceType!
		status: PriceStatus!
		validFrom: DateTime
		validUntil: DateTime
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	type Currency {
		id: ID!
		code: String!
		name: String!
		symbol: String!
		status: CurrencyStatus!
		exchangeRate: Float
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	input CreateProductInput {
		name: String!
		description: String
		categoryId: ID!
		productTypeId: ID!
		status: ProductStatus
		organizationId: ID!
		imageUrl: String
		sku: String
		barcode: String
		weight: Float
		dimensions: ProductDimensionsInput
		meta: JSON
	}

	input ProductDimensionsInput {
		length: Float!
		width: Float!
		height: Float!
	}

	input CreateProductCategoryInput {
		name: String!
		description: String
	}

	input SaveProductTypeInput {
		id: ID
		name: String!
		description: String
		organizationId: ID!
	}

	input AddPriceInput {
		productId: ID!
		currencyId: ID!
		amount: Float!
		type: PriceType
		status: PriceStatus
		validFrom: DateTime
		validUntil: DateTime
	}

	input UpdateCurrencyInput {
		currencyId: ID!
		name: String
		symbol: String
		status: CurrencyStatus
		exchangeRate: Float
	}

	type CreateProductResult {
		success: Boolean!
		product: Product
		error: String
	}

	type CreateProductCategoryResult {
		success: Boolean!
		productCategory: ProductCategory
		error: String
	}

	type SaveProductTypeResult {
		success: Boolean!
		productType: ProductType
		error: String
	}

	type AddPriceResult {
		success: Boolean!
		price: Price
		error: String
	}

	type UpdateCurrencyResult {
		success: Boolean!
		currency: Currency
		error: String
	}

	type Query {
		products(organizationId: ID!): [Product!]!
		product(id: ID!): Product
		productBySlug(slug: String!): Product
		productsByCategory(categoryId: ID!): [Product!]!
		productsByType(productTypeId: ID!): [Product!]!
		productCategories: [ProductCategory!]!
		productCategory(id: ID!): ProductCategory
		productCategoryBySlug(slug: String!): ProductCategory
		productTypes(organizationId: ID!): [ProductType!]!
		productType(id: ID!): ProductType
		productTypeBySlug(slug: String!, organizationId: ID!): ProductType
		prices(productId: ID!): [Price!]!
		currencies: [Currency!]!
		currency(id: ID!): Currency
		currencyByCode(code: String!): Currency
	}

	type Mutation {
		createProduct(input: CreateProductInput!): CreateProductResult!
		createProductCategory(input: CreateProductCategoryInput!): CreateProductCategoryResult!
		saveProductType(input: SaveProductTypeInput!): SaveProductTypeResult!
		addPrice(input: AddPriceInput!): AddPriceResult!
		updateCurrency(input: UpdateCurrencyInput!): UpdateCurrencyResult!
	}

	scalar DateTime
	scalar JSON
`;
