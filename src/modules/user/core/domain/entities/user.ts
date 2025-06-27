import type { Url } from "@/src/modules/shared/value-objects";
import { type Id, id, url } from "@/src/modules/shared/value-objects";
import { type Email, email, type Username, username } from "../value-objects";

export namespace User {
	export type Model = {
		id: Id;
		name: string;
		email: Email;
		username: Username;
		emailVerified: boolean;
		bio: string;
		avatar?: Url;
    createdAt?: Date 
    updatedAt?: Date
	};

	export const create = (props: Omit<User.Model, "id">): User.Model => ({
		id: id(),
		...props,
		email: email(props.email),
		username: username(props.username),
		avatar: props.avatar ?? url(props.avatar),
	});
}
