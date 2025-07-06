import { z } from "zod";
import { AppError, ErrorCode } from "@/src/modules/shared/errors/app-error";

export type Username = string;

const usernameSchema = z
	.string()
	.min(3, { message: "Username must be at least 3 characters long" })
	.max(30, { message: "Username must be at most 30 characters long" })
	.regex(/^[a-zA-Z0-9._]+$/, {
		message:
			"Username can only contain letters, numbers, periods, and underscores. No spaces or special characters allowed.",
	})
	.refine((val) => !val.includes(" "), {
		message: "Username cannot contain spaces.",
	})
	.refine((val) => !val.startsWith("."), {
		message: "Username cannot start with a period.",
	});

export const username = (username?: string): Username => {
	const result = usernameSchema.safeParse(username);
	if (!result.success) {
		throw new AppError(
			result.error.errors[0].message,
			400,
			ErrorCode.USERNAME_INVALID,
		);
	}
	return result.data as Username;
};
