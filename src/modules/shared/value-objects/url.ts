import { z } from "zod";
import { AppError, ErrorCode } from "@/src/modules/shared/errors/app-error";

export type Url = string;
export const url = (url?: string): Url => {
	const schema = z.string().url({ message: "Invalid URL format" });
	const result = schema.safeParse(url);
	if (!result.success) {
		throw new AppError(
			result.error.errors[0].message,
			400,
			ErrorCode.URL_INVALID,
		);
	}
	return result.data;
};
