import type { Organization } from "../../../domain/entities";
import type { OrganizationRepository } from "../../../ports/outbound/organization-repository";

export namespace ILoadStores {
	export type Params = {
		page?: number;
		limit?: number;
		search?: string;
	};

	export type Result = {
		stores: Organization.Store[];
		total: number;
		page: number;
		limit: number;
	};
}

export class LoadStoresUseCase {
	constructor(
		private readonly organizationRepository: OrganizationRepository,
	) {}

	async execute(params: ILoadStores.Params): Promise<ILoadStores.Result> {
		try {
			console.log("🔍 [DEBUG] LoadStoresUseCase.execute - params:", params);
			
			const result = await this.organizationRepository.listStores(params);
			console.log("🔍 [DEBUG] LoadStoresUseCase.execute - repository result:", result);

			const response = {
				stores: result.items,
				total: result.totalItems,
				page: params.page ?? 1,
				limit: params.limit ?? 10,
			};

			console.log("🔍 [DEBUG] LoadStoresUseCase.execute - response:", response);
			return response;
		} catch (error) {
			console.error("❌ [DEBUG] Error in LoadStoresUseCase.execute:", {
				error: error instanceof Error ? {
					name: error.name,
					message: error.message,
					stack: error.stack,
				} : error,
				params,
			});
			throw error;
		}
	}
}
