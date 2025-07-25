import {
	type Id,
	id,
	Slug,
	type Url,
	url,
} from "@/src/modules/shared/value-objects";
import type { Price } from "./price";

export namespace Product {
	export enum Status {
		ACTIVE = "active",
		INACTIVE = "inactive",
		DRAFT = "draft",
		DELETED = "deleted",
	}

	export type Props = {
		id: Id;
		name: string;
		slug: string;
		description?: string;
		categoryId: Id;
		productTypeId: Id;
		status: Status;
		organizationId: Id;
		createdById: Id;
		imageUrl?: Url | string;
		sku?: string;
		barcode?: string;
		default_price_id: Id;
		default_price?: {
			id: Id;
			currency: string;
			unitAmount: number;
			type: Price.Type;
		};
		price?: Price.Model;
		weight?: number;
		dimensions?: {
			length: number;
			width: number;
			height: number;
		};
		meta?: Record<string, unknown>;
		createdAt: Date;
		updatedAt: Date;
	};

	export type Model = Omit<Props, "slug"> & {
		slug: Slug;
	};

	export type B2CProduct = {
		slug: string;
		name: string;
		description?: string;
		imageUrl?: string;
		weight?: number;
		dimensions?: {
			length: number;
			width: number;
			height: number;
		};
		category: {
			slug: string;
			name: string;
		};
		productType: {
			slug: string;
			name: string;
		};
		price?: Price.Model | null;
		createdAt: Date;
		updatedAt: Date;
	};

	export type CreateParams = {
		name: string;
		description?: string;
		categoryId: Id;
		productTypeId: Id;
		status?: Status;
		organizationId: Id;
		createdById: Id;
		default_price_id: Id;
		default_price?: {
			id: Id;
			currency: string;
			unitAmount: number;
			type: Price.Type;
		};
		imageUrl?: string;
		sku?: string;
		barcode?: string;
		weight?: number;
		dimensions?: {
			length: number;
			width: number;
			height: number;
		};
		meta?: Record<string, unknown>;
	};

	export class Entity {
		private constructor(private readonly props: Model) {}

		static create(params: CreateParams): Entity {
			const now = new Date();
			const product: Model = {
				id: id(),
				name: params.name,
				slug: Slug.create(params.name),
				default_price_id: params.default_price_id,
				default_price: params.default_price,
				description: params.description,
				categoryId: params.categoryId,
				productTypeId: params.productTypeId,
				status: params.status ?? Status.DRAFT,
				organizationId: params.organizationId,
				createdById: params.createdById,
				imageUrl: params.imageUrl ? url(params.imageUrl) : undefined,
				sku: params.sku,
				barcode: params.barcode,
				weight: params.weight,
				dimensions: params.dimensions,
				meta: params.meta ?? {},
				createdAt: now,
				updatedAt: now,
			};
			return new Entity(product);
		}

		static fromModel(model: Props): Entity {
			return new Entity({
				...model,
				slug: Slug.create(model.name),
			});
		}

		get id(): Id {
			return this.props.id;
		}
		get name(): string {
			return this.props.name;
		}
		get slug(): Slug {
			return this.props.slug;
		}
		get description(): string | undefined {
			return this.props.description;
		}
		get categoryId(): Id {
			return this.props.categoryId;
		}
		get productTypeId(): Id {
			return this.props.productTypeId;
		}
		get status(): Status {
			return this.props.status;
		}
		get organizationId(): Id {
			return this.props.organizationId;
		}
		get createdById(): Id {
			return this.props.createdById;
		}
		get imageUrl(): Url | string | undefined {
			return this.props.imageUrl;
		}
		get sku(): string | undefined {
			return this.props.sku;
		}
		get barcode(): string | undefined {
			return this.props.barcode;
		}
		get weight(): number | undefined {
			return this.props.weight;
		}
		get dimensions():
			| { length: number; width: number; height: number }
			| undefined {
			return this.props.dimensions;
		}
		get meta(): Record<string, unknown> | undefined {
			return this.props.meta;
		}
		get createdAt(): Date {
			return this.props.createdAt;
		}
		get updatedAt(): Date {
			return this.props.updatedAt;
		}

		get default_price_id(): Id {
			return this.props.default_price_id;
		}

		get default_price(): Props["default_price"] | undefined {
			return this.props.default_price;
		}

		updateDefaultPrice(price: {
			id: Id;
			currency: string;
			unitAmount: number;
			type: Price.Type;
		}): void {
			this.props.default_price_id = price.id;
			this.props.default_price = price;
			this.props.updatedAt = new Date();
		}

		updateName(name: string): void {
			this.props.name = name;
			this.props.slug = Slug.create(name);
			this.props.updatedAt = new Date();
		}

		updateDescription(description: string): void {
			this.props.description = description;
			this.props.updatedAt = new Date();
		}

		updateCategoryId(categoryId: Id): void {
			this.props.categoryId = categoryId;
			this.props.updatedAt = new Date();
		}

		updateProductTypeId(productTypeId: Id): void {
			this.props.productTypeId = productTypeId;
			this.props.updatedAt = new Date();
		}

		updateStatus(status: Status): void {
			this.props.status = status;
			this.props.updatedAt = new Date();
		}

		updateImageUrl(imageUrl: string): void {
			this.props.imageUrl = url(imageUrl);
			this.props.updatedAt = new Date();
		}

		updateSku(sku: string): void {
			this.props.sku = sku;
			this.props.updatedAt = new Date();
		}

		updateBarcode(barcode: string): void {
			this.props.barcode = barcode;
			this.props.updatedAt = new Date();
		}

		updateWeight(weight: number): void {
			this.props.weight = weight;
			this.props.updatedAt = new Date();
		}

		updateDimensions(dimensions: {
			length: number;
			width: number;
			height: number;
		}): void {
			this.props.dimensions = dimensions;
			this.props.updatedAt = new Date();
		}

		updateMeta(meta: Record<string, unknown>): void {
			this.props.meta = meta;
			this.props.updatedAt = new Date();
		}

		isActive(): boolean {
			return this.props.status === Status.ACTIVE;
		}

		updateFromDTO(
			params: Partial<Omit<CreateParams, "organizationId" | "createdById">>,
		): void {
			if (params.name !== undefined) this.updateName(params.name);
			if (params.description !== undefined)
				this.updateDescription(params.description);
			if (params.categoryId !== undefined)
				this.updateCategoryId(params.categoryId);
			if (params.productTypeId !== undefined)
				this.updateProductTypeId(params.productTypeId);
			if (params.status !== undefined) this.updateStatus(params.status);
			if (params.imageUrl !== undefined) this.updateImageUrl(params.imageUrl);
			if (params.sku !== undefined) this.updateSku(params.sku);
			if (params.barcode !== undefined) this.updateBarcode(params.barcode);
			if (params.weight !== undefined) this.updateWeight(params.weight);
			if (params.dimensions !== undefined)
				this.updateDimensions(params.dimensions);
			if (params.meta !== undefined) this.updateMeta(params.meta);

			this.props.updatedAt = new Date();
		}

		toJSON(): Props {
			return { ...this.props, slug: this.props.slug.value };
		}
	}
}
