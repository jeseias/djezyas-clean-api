import { cors } from "@elysiajs/cors";
import { yoga } from "@elysiajs/graphql-yoga";
import { Elysia } from "elysia";
import { GraphQLError } from "graphql";
import { AppError } from "@/src/modules/shared/errors/app-error";
import { appResolvers, appTypeDefs } from "../graphql/graphql-setup";
import { getUserFromRequest } from "./plugins/auth-middleware";
import { graphiqlAuthHandler } from "./plugins/graphiql-auth";
import { routes } from "./routes";
import { protectedDocs } from "./swagger/swagger-config";

export const app = new Elysia()
  .use(cors({
    origin: (request: Request) => {
      const origin = request.headers.get('origin');
      console.log('CORS request from origin:', origin);
      
      const allowedOrigins = [
        'https://djezyas.com', 
        'https://www.djezyas.com',
        'https://www.djezyas.com/', // With trailing slash
        'http://localhost:3000', // For local development
        'http://localhost:5173', // For Vite dev server
        'http://localhost:4173', // For Vite preview
      ];
      
      // Handle requests without origin (like same-origin requests)
      if (!origin) {
        console.log('No origin header, allowing request');
        return true;
      }
      
      const isAllowed = allowedOrigins.includes(origin);
      console.log('Origin allowed:', isAllowed, 'for origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      console.log('Request headers:', Object.fromEntries(request.headers.entries()));
      
      return isAllowed;
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Accept', 'Origin'], 
    methods: ['GET', 'POST', 'OPTIONS'],
    exposeHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  }))
  .use(protectedDocs)
  .use(
    yoga({
      typeDefs: appTypeDefs,
      resolvers: appResolvers,
      graphiql: false,
      path: "graphql",
      context: async ({ request }) => getUserFromRequest(request),
      maskedErrors: {
        maskError: (
          error: unknown,
          message: string,
          isDev?: boolean,
        ): Error => {
          if (
            error instanceof GraphQLError &&
            error.originalError instanceof AppError
          ) {
            return new GraphQLError(error.message, {
              nodes: error.nodes,
              source: error.source,
              positions: error.positions,
              path: error.path,
              originalError: error.originalError,
              extensions: {
                ...error.extensions,
                code: error.originalError.code,
              },
            });
          }

          if (isDev) {
            return new Error(
              `${message}: ${error instanceof Error ? error.message : String(error)}`
            );
          }

          return new Error(message);
        },
        errorMessage: "Unexpected error.",
      },
    }),
  )
  .use(routes)
  .get("/graphiql", ({ request }) => graphiqlAuthHandler(request))
  .get("/health", () => ({ status: "ok", cors: "enabled" }));
