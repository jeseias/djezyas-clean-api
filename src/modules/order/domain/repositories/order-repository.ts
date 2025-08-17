import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { Id } from "@/src/modules/shared/value-objects";
import type { Order } from "../entities";

export namespace OrderFilters {
	export type Status = Order.FulfillmentStatus;

	export type Filters = {
		status?: Status;
		search?: string;
		minAmount?: number;
		maxAmount?: number;
		hasItems?: boolean;
		createdAfter?: Date;
		createdBefore?: Date;
		updatedAfter?: Date;
		updatedBefore?: Date;
		limit?: number;
		offset?: number;
		sortBy?: "totalAmount" | "createdAt" | "updatedAt" | "status";
		sortOrder?: "asc" | "desc";
	};
}

export type OrderRepository = Pick<
	Repository<Order.Model>,
	"findById" | "create" | "update" | "delete"
> & {
	findManyByIds: (ids: string[]) => Promise<Order.Model[]>;
	findAllByUserId: (
		userId: Id,
		filters: OrderFilters.Filters,
	) => Promise<{
		items: Order.Model[];
		totalItems: number;
	}>;
	findAllByOrganizationId: (
		organizationId: Id,
		filters: OrderFilters.Filters,
	) => Promise<{
		items: Order.Model[];
		totalItems: number;
	}>;
	findAllByTransactionId: (transactionId: string) => Promise<Order.Model[]>;
};
