import { type Id, id } from "@/src/modules/shared/value-objects";
import type { Email, Username } from "../value-objects";
import type { Url } from "../value-objects/url";

export namespace User {
	export type Model = {
		id: Id;
		name: string;
		email: Email;
		username: Username;
		emailVerified: boolean;
		bio: string;
		avatar: Url;
	};

	export const create = (props: Omit<User.Model, "id">): User.Model => ({
		id: id(),
		...props,
	});
}
