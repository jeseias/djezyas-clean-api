import { makeVerifyTokenUseCase } from "@/src/modules/user/adapters/factories/use-cases.factory";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";

export function requireAuth(context: any) {
	if (!context.user) throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
	return context.user;
}

export async function getUserFromRequest(request: Request) {
	const token = request.headers.get("x-access-token");
	if (!token) {
		return { user: null };
	}
	try {
		const verifyTokenUseCase = makeVerifyTokenUseCase();
		const result = await verifyTokenUseCase.execute({ token });
		return {
			user: {
				id: result.userId,
				email: result.email,
				username: result.username,
				role: result.role,
			},
		};
	} catch {
		return { user: null };
	}
}

export function wrapResolvers(
	resolvers: Record<string, any>,
	publicMutations: string[] = [],
) {
	const wrapped: Record<string, unknown> = {};
	for (const [key, fn] of Object.entries(resolvers)) {
		if (publicMutations.includes(key)) {
			wrapped[key] = fn;
		} else {
			wrapped[key] = (parent: any, args: any, context: any, info: any) => {
				requireAuth(context);
				return fn(parent, args, context, info);
			};
		}
	}
	return wrapped;
}

export function withUser<TArgs = any, TResult = any>(
	resolver: (
		args: TArgs,
		useCaseContext: {
			userId: string;
			userEmail: string;
			userUsername: string;
			userRole: string;
		},
		info?: any,
	) => Promise<TResult>,
	options?: {
		isAdmin?: boolean;
	},
) {
	return async (_: any, args: TArgs, context: any, info: any) => {
		if (!context.user) throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
		
		// Check if admin role is required
		if (options?.isAdmin && context.user.role !== "admin") {
			throw new AppError("Admin access required", 403, ErrorCode.ADMIN_ACCESS_REQUIRED);
		}
		
		const useCaseContext = {
			userId: context.user.id,
			userEmail: context.user.email,
			userUsername: context.user.username,
			userRole: context.user.role,
		};
		return await resolver(args, useCaseContext, info);
	};
}
