export type CryptoRepository = {
	hash: (password: string) => Promise<string>;
	compare: (password: string, hash: string) => Promise<boolean>;
	generateToken: (
		payload: Record<string, unknown>,
		expiresIn?: string,
	) => Promise<string>;
	verifyToken: (token: string) => Promise<Record<string, unknown>>;
};
