import type { Email, Id, Username } from "../value-objects";
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
}
