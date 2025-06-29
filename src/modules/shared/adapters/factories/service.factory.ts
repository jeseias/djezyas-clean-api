import { createPasswordHasher } from "../crypto";
import { createJwtManager } from "../jwt";
import { createPostmarkEmailService } from "../postmark";

export const postmarkEmailService = createPostmarkEmailService();
export const jwtManager = createJwtManager();
export const passwordHasher = createPasswordHasher();
