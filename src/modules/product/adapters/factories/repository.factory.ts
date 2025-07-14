import { MongoosePriceRepository } from "@/src/modules/product/adapters/db/mongoose/repositories/price-repository";
import { MongooseProductCategoryRepository } from "@/src/modules/product/adapters/db/mongoose/repositories/product-category-repository";
import { MongooseProductRepository } from "@/src/modules/product/adapters/db/mongoose/repositories/product-repository";
import { MongooseProductTypeRepository } from "@/src/modules/product/adapters/db/mongoose/repositories/product-type-repository";

export const productMongooseRepository = new MongooseProductRepository();
export const productCategoryMongooseRepository =
	new MongooseProductCategoryRepository();
export const productTypeMongooseRepository =
	new MongooseProductTypeRepository();
export const priceMongooseRepository = new MongoosePriceRepository();
