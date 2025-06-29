import { AppError } from "@/src/modules/shared/errors";
import { Session } from "../../../domain/entities";
import type { SessionRepository } from "../../../ports/outbound/session-repository";

export namespace Logout {
	export type Params = {
		accessToken: string;
	};

	export type Result = {
		message: string;
	};
}

export class LogoutUseCase {
	constructor(
		private readonly sessionRepository: Pick<
			SessionRepository,
			"findByAccessToken" | "update"
		>,
	) {}

	async execute(params: Logout.Params): Promise<Logout.Result> {
		const { accessToken } = params;

		const sessionModel =
			await this.sessionRepository.findByAccessToken(accessToken);
		if (!sessionModel) {
			throw new AppError("Session not found", 404);
		}

		const session = Session.Entity.fromModel(sessionModel);

		if (!session.isActive) {
			throw new AppError("Session is already inactive", 400);
		}

		session.deactivate();

		await this.sessionRepository.update(session.toJSON());

		return {
			message: "Logged out successfully",
		};
	}
}
