import { z } from "zod";
import { AppError, ErrorCode } from "@/src/modules/shared/errors/app-error";

export type Phone = string;

const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, {
	message:
		"Invalid phone number format. Use international format (e.g., +1234567890)",
});

export const phone = (phone?: string): Phone => {
	const result = phoneSchema.safeParse(phone);
	if (!result.success) {
		throw new AppError(
			result.error.errors[0].message,
			400,
			ErrorCode.PHONE_INVALID,
		);
	}
	return result.data;
};
