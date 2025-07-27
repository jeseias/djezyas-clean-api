import type { ControllerRequest } from "@/src/modules/shared/adapters/http/elysia/controller";
import type { PreRunner } from "@/src/modules/shared/adapters/http/elysia/pre-runners";

/**
 * Transforms bracket notation form data (e.g., "price[currency]", "price[unitAmount]")
 * into nested objects (e.g., { price: { currency: "...", unitAmount: ... } })
 * before validation.
 */
export function transformBracketNotationPreRunner<Body>(): PreRunner<
	Body,
	unknown,
	unknown,
	unknown
> {
	return async (req: ControllerRequest<Body, unknown, unknown, unknown>) => {
		const transformedBody: any = { ...req.body };

		// Transform bracket notation to nested objects
		Object.keys(req.body as any).forEach((key) => {
			if (key.includes("[") && key.includes("]")) {
				const [parentKey, childKey] = key.split("[");
				const cleanChildKey = childKey.replace("]", "");

				if (!transformedBody[parentKey]) {
					transformedBody[parentKey] = {};
				}

				transformedBody[parentKey][cleanChildKey] = (req.body as any)[key];
				delete transformedBody[key];
			}
		});

		req.body = transformedBody;
	};
}
