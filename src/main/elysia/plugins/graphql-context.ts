import { getUserFromRequest } from "./auth-middleware";

export const createGraphQLContext = async ({
	request,
}: {
	request: Request;
}) => {
	console.log("GraphQL request received:", {
		method: request.method,
		url: request.url,
		headers: Object.fromEntries(request.headers.entries()),
	});

	try {
		const userContext = await getUserFromRequest(request);
		console.log("User context resolved:", userContext);
		return userContext;
	} catch (error) {
		console.error("Error in getUserFromRequest:", error);
		return { user: null };
	}
};
