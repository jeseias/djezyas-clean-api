import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { User } from "../../domain/entities/user";

export type UserRepository = Pick<
	Repository<User.Model>,
	"create" | "update" | "findById"
> & {
	findByEmail(email: string): Promise<User.Model | null>;
	findByUsername(username: string): Promise<User.Model | null>;
	findByPhone(phone: string): Promise<User.Model | null>;
	findByPasswordResetToken(token: string): Promise<User.Model | null>;
};
