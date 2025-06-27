import { z } from "zod";

export type Email = string;
export const email = (email?: string): Email => {
	const schema = z.string().email();
	const result = schema.safeParse(email);

	if (!result.success) {
		throw new Error("Invalid email");
	}

	return result.data;
};
