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
      console.log('Request method:', request.method);
      
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
      
      return isAllowed;
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Accept', 'Origin'], 
    methods: ['GET', 'POST', 'OPTIONS'],
    exposeHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
    maxAge: 86400, // Cache preflight for 24 hours
  }))
  .use(protectedDocs)
  .use(
    yoga({
      typeDefs: appTypeDefs,
      resolvers: appResolvers,
      graphiql: false,
      path: "graphql",
      context: async ({ request }) => {
        console.log('GraphQL request received:', {
          method: request.method,
          url: request.url,
          headers: Object.fromEntries(request.headers.entries())
        });
        
        try {
          const userContext = await getUserFromRequest(request);
          console.log('User context resolved:', userContext);
          return userContext;
        } catch (error) {
          console.error('Error in getUserFromRequest:', error);
          return { user: null };
        }
      },
      maskedErrors: {
        maskError: (
          error: unknown,
          message: string,
          isDev?: boolean,
        ): Error => {
          console.log('GraphQL error details:', {
            error: error instanceof Error ? error.message : String(error),
            errorType: error?.constructor?.name,
            message,
            isDev,
            stack: error instanceof Error ? error.stack : undefined
          });
          
          if (
            error instanceof GraphQLError &&
            error.originalError instanceof AppError
          ) {
            console.log('AppError detected:', error.originalError);
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
  .get("/health", () => ({ status: "ok", cors: "enabled" }))
  .post("/test", ({ body }) => ({ 
    status: "ok", 
    method: "POST", 
    body: body,
    message: "POST request working" 
  }))
  .options("/graphql", ({ request }) => {
    console.log('OPTIONS request to /graphql');
    const origin = request.headers.get('origin');
    console.log('OPTIONS origin:', origin);
    
    const allowedOrigins = [
      'https://djezyas.com', 
      'https://www.djezyas.com',
      'https://www.djezyas.com/',
    ];
    
    const isAllowed = origin ? allowedOrigins.includes(origin) : false;
    console.log('OPTIONS origin allowed:', isAllowed);
    
    if (isAllowed) {
      return new Response(null, { 
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin || '',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token, Accept, Origin',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400'
        }
      });
    } else {
      return new Response(null, { status: 403 });
    }
  })
  .post("/graphql", ({ request, body }) => {
    console.log('POST request to /graphql');
    const origin = request.headers.get('origin');
    console.log('POST origin:', origin);
    
    // Let the GraphQL Yoga handler process this
    // We're just adding logging here
    return;
  });
