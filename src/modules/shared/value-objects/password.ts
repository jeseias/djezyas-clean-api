import { z } from "zod";
import { AppError, ErrorCode } from "../errors/app-error";

export const passwordSchema = z
	.string()
	.min(7, "Password must be at least 7 characters")
	.regex(/[A-Z]/, "Password must contain at least one capital letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol");

export type Password = z.infer<typeof passwordSchema>;

export const password = (value: string): Password => {
	try {
		return passwordSchema.parse(value);
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new AppError(
				`Invalid password: ${error.errors.map((e) => e.message).join(", ")}`,
				400,
				ErrorCode.PASSWORD_INVALID,
			);
		}
		throw error;
	}
};
