import { model, models, Schema } from "mongoose";
import type { Cart } from "@/src/modules/order/domain/entities";

const cartItemSchema = new Schema<Cart.Item>(
	{
		productId: {
			type: String,
			required: true,
		},
		quantity: {
			type: Number,
			required: true,
		},
	},
	{
		_id: false,
		timestamps: false,
	},
);

const cartSchema = new Schema<Cart.Model>(
	{
		id: {
			type: String,
			required: true,
		},
		userId: {
			type: String,
			required: true,
		},
		items: {
			type: [cartItemSchema],
			default: [],
		},
	},
	{
		timestamps: true,
	},
);

export const CartModel = models.Cart || model<Cart.Model>("Cart", cartSchema);
