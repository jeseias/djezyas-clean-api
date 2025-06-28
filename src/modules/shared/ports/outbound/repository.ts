export type Repository<T> = {
	create: (data: T) => Promise<T>;
	list: (params: { page: number; limit: number }) => Promise<{
		totalItems: number;
		items: T[];
	}>;
	findById: (id: string) => Promise<T | null>;
	update: (data: Partial<T>) => Promise<T>;
	delete: (id: string) => Promise<void>;
};
