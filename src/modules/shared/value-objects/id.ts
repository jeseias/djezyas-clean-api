import { v4 as uuidv4, validate } from "uuid";

export type Id = string;
export const id = (id?: string) => {
	if (id && !validate(id)) {
		throw new Error("Invalid ID");
	}

	return id ?? uuidv4();
};
