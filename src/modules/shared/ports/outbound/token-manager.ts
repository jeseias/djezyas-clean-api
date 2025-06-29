export type TokenManager = {
	generateToken(
		payload: Record<string, unknown>,
		expiresIn?: string,
	): Promise<string>;
	verifyToken(token: string): Promise<Record<string, unknown>>;
};
