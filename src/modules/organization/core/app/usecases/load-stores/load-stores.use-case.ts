import type { Organization } from "../../../domain/entities"
import type { OrganizationRepository } from "../../../ports/outbound/organization-repository"

export namespace ILoadStores {
  export type Params = {
    page?: number 
    limit?: number 
    search?: string
  }

  export type Result = {
    stores: Organization.Store[]
    total: number
    page: number
    limit: number
  }
}

export class LoadStoresUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(params: ILoadStores.Params): Promise<ILoadStores.Result> {
    const result = await this.organizationRepository.listStores(params)

    return {
      stores: result.items,
      total: result.totalItems,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    }
  }
}