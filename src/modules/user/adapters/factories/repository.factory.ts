import { MongooseUserRepository } from "../db/mongoose";
import { MongooseSessionRepository } from "../db/mongoose/session-repository";

export const userMongooseRepository = new MongooseUserRepository();
export const sessionMongooseRepository = new MongooseSessionRepository();
