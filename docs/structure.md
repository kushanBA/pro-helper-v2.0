# CLAUDE.md --- Node.js + TypeScript Backend Project Guide

This file gives Claude project-level guidance for building and
maintaining a clean, secure, testable Node.js backend using TypeScript.

## 1. Project goals

When changing this project:

-   Prefer simple, readable, maintainable solutions over clever
    abstractions.
-   Follow the existing project structure and conventions before
    introducing new patterns.
-   Use TypeScript strict mode. Avoid `any`; use `unknown` when a value
    is not yet known and narrow it safely.
-   Keep business logic independent from HTTP, database, and framework
    details where practical.
-   Validate all untrusted input at system boundaries.
-   Handle errors centrally and return consistent API responses.
-   Add or update tests for meaningful behavior changes.
-   Do not introduce dependencies, architectural changes, or breaking
    API changes without explaining the reason.
-   Do not silently remove existing functionality.

## 2. Recommended technology stack

Use these as defaults for a new project. If the repository already uses
an equivalent library, keep the existing choice unless there is a clear
reason to change it.

  -----------------------------------------------------------------------
  Area                    Recommended choice      Purpose
  ----------------------- ----------------------- -----------------------
  Runtime                 Node.js LTS             JavaScript runtime

  Language                TypeScript, strict mode Static type checking

  HTTP framework          Express 5               Routing and HTTP
                                                  middleware

  Validation              Zod                     Validate request data
                                                  and environment
                                                  variables

  Database                PostgreSQL              Relational database

  ORM                     Prisma **or** Drizzle   Database access and
                                                  migrations

  Logging                 Pino                    Structured application
                                                  logs

  Authentication          `jose` for JWT/JWS/JWE, Token handling and
                          plus Argon2 for         password hashing
                          passwords               

  Security headers        Helmet                  HTTP security headers

  CORS                    `cors`                  Configure cross-origin
                                                  access

  Rate limiting           `express-rate-limit`    Limit repeated requests

  Environment variables   `dotenv` for local      Load local environment
                          development             configuration

  Tests                   Vitest                  Unit and integration
                                                  test runner

  HTTP integration tests  Supertest               Test Express endpoints

  Linting                 ESLint with TypeScript  Find code-quality
                          ESLint                  issues

  Formatting              Prettier                Consistent formatting

  Development runner      `tsx`                   Run TypeScript during
                                                  development

  API documentation       OpenAPI with            Document HTTP endpoints
                          `swagger-ui-express` or 
                          an equivalent           
  -----------------------------------------------------------------------

### Package installation starting point

Install only what the project needs. For an Express + TypeScript +
PostgreSQL project, a typical starting point is:

``` bash
npm install express zod pino helmet cors express-rate-limit dotenv
npm install jose argon2
npm install @prisma/client
npm install -D typescript tsx prisma
npm install -D vitest supertest @types/supertest
npm install -D eslint typescript-eslint prettier
```

Depending on the project, also install the relevant Express and Node
type packages:

``` bash
npm install -D @types/node @types/express @types/cors
```

If using Drizzle instead of Prisma, use Drizzle's packages and migration
tooling rather than installing both ORMs. Do not install both Prisma and
Drizzle without a specific, justified need.

For a smaller or performance-focused service, Fastify is a good
alternative to Express. Choose one HTTP framework; do not mix
frameworks.

## 3. TypeScript configuration

Enable strict checking in `tsconfig.json`. A suitable baseline is:

``` json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

Adjust module settings to match the package's chosen module system. Do
not change CommonJS/ESM configuration casually; ensure `package.json`,
TypeScript settings, imports, and runtime behavior agree.

TypeScript is not runtime validation. Validate incoming JSON, query
parameters, path parameters, environment variables, and external service
responses with schemas such as Zod.

## 4. Suggested project structure

Keep the structure understandable. Organize by feature when the
application grows:

``` text
src/
  app.ts                    # Configure Express and middleware
  server.ts                 # Start the HTTP server
  config/
    env.ts                  # Parse and validate environment variables
    logger.ts               # Pino configuration
  common/
    errors/
      app-error.ts
      error-handler.ts
    middleware/
      auth.middleware.ts
      validate.middleware.ts
    types/
  modules/
    users/
      user.routes.ts
      user.controller.ts
      user.service.ts
      user.repository.ts
      user.schema.ts
      user.types.ts
    auth/
      auth.routes.ts
      auth.controller.ts
      auth.service.ts
      auth.schema.ts
  database/
    client.ts
    migrations/
  tests/
```

Not every feature needs every file. Avoid creating empty layers or files
solely to follow a template.

### Responsibilities

-   **Routes:** Map HTTP methods and paths to middleware/controllers.
    Keep them thin.
-   **Controllers:** Translate HTTP requests into application calls and
    format HTTP responses. Do not put complex business rules here.
-   **Services/use cases:** Contain business rules and coordinate
    application operations.
-   **Repositories:** Encapsulate database queries and persistence
    details.
-   **Schemas:** Validate and parse external input.
-   **Database client:** Create and export a single configured database
    client.
-   **Middleware:** Handle cross-cutting HTTP concerns such as
    authentication, validation, and request IDs.

For small applications, a service may call the ORM directly. Introduce
repository abstractions when they clarify responsibilities, isolate
persistence, or improve testing---not automatically for every table.

## 5. Architecture and dependency rules

-   Keep dependencies flowing in one direction: HTTP/controller layer →
    application/service layer → persistence or external adapters.
-   Lower-level business logic should not import controllers or route
    files.
-   Avoid circular dependencies such as
    `user.service → order.service → user.service`.
-   If two modules need to coordinate, consider a higher-level use
    case/service that calls both.
-   Share small, stable types or utilities from a neutral module only
    when they genuinely belong there.
-   Do not create a giant `common` or `utils` folder that becomes a
    dumping ground.
-   Prefer constructor/function dependency injection for services that
    need repositories or external clients.
-   Avoid importing the entire application into individual modules.
-   Keep side effects (database access, network calls, file operations)
    at clear boundaries.

Example of dependency direction:

``` text
HTTP route
   ↓
Controller
   ↓
Use case / Service
   ↓
Repository interface
   ↑
Database repository implementation
```

A service should depend on an abstraction when that abstraction provides
a real benefit. Do not add interfaces for every function without a
reason.

## 6. JavaScript and TypeScript coding standards

-   Use `const` by default; use `let` only when reassignment is
    required. Avoid `var`.
-   Prefer `async/await` for asynchronous code and always handle
    rejected promises.
-   Do not use floating, unhandled promises.
-   Use explicit return types for exported functions and important
    service methods when they improve clarity.
-   Use `type` for unions/intersections and `interface` when describing
    extendable object contracts; be consistent.
-   Use `unknown` instead of `any` for untrusted values.
-   Avoid non-null assertions (`!`) unless the invariant is clear and
    documented.
-   Avoid type assertions that merely silence compiler errors. Narrow
    types or validate data instead.
-   Use enums sparingly; string-union types are often simpler for fixed
    sets of values.
-   Keep functions focused and reasonably small.
-   Give variables and functions descriptive names.
-   Avoid deeply nested conditionals; use early returns when clearer.
-   Do not duplicate business rules across controllers and services.
-   Do not mutate shared objects unexpectedly.
-   Use `Promise.all` for independent asynchronous work, but do not
    parallelize operations that depend on each other's results.
-   Use pagination for endpoints that can return large collections.

## 7. API design and request validation

-   Use resource-oriented, consistent REST endpoints.
-   Use the correct HTTP methods and status codes.
-   Validate `body`, `params`, and `query` before business logic runs.
-   Treat all client input as untrusted, even when TypeScript types
    appear correct.
-   Whitelist accepted fields; do not pass an entire request body
    directly into a database create/update call.
-   Normalize values where appropriate (for example, trim user-facing
    names and normalize email addresses).
-   Return a consistent response shape and consistent error format.
-   Use pagination, filtering, and sorting with explicit limits.
-   Do not expose database stack traces, internal IDs unnecessarily,
    secrets, or implementation details in API responses.
-   Document endpoints, validation rules, status codes, and example
    responses with OpenAPI.

Example Zod schema:

``` typescript
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(12).max(128)
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

Validate the request using the schema before calling the service. Do not
rely on a TypeScript interface alone to validate HTTP input.

## 8. Error handling

-   Use a central error-handling middleware.
-   Create a small application error type for expected errors (for
    example, not found, conflict, and unauthorized).
-   Do not use `try/catch` everywhere if the error can be passed to the
    central handler.
-   Catch errors when you can recover, add useful context, or translate
    an external error.
-   Never return raw internal error messages or stack traces to clients
    in production.
-   Log unexpected errors with a request ID and relevant safe context.
-   Do not swallow errors or return success after an operation failed.

Example pattern:

``` typescript
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "AppError";
  }
}
```

Make sure the error middleware matches the installed Express major
version and forwards errors correctly.

## 9. Database practices

-   Use migrations; do not rely on production schema changes made
    manually.
-   Keep database access out of route files and controllers.
-   Use transactions when multiple database operations must succeed or
    fail together.
-   Add database constraints and indexes for important uniqueness and
    lookup rules.
-   Use parameterized queries or the ORM's safe query APIs. Never
    concatenate user input into SQL.
-   Select only the fields needed for a response.
-   Avoid N+1 queries; use appropriate joins, includes, or batching.
-   Do not expose ORM model objects directly if they contain internal
    fields.
-   Handle unique-constraint and foreign-key errors intentionally.
-   Store timestamps consistently, preferably in UTC.
-   Do not commit generated secrets, database dumps, or real customer
    data.

## 10. Authentication and security

-   Hash passwords with Argon2id (or a well-reviewed alternative); never
    store plain-text passwords.
-   Never write your own cryptographic algorithms or token format.
-   Use a maintained library for JWT handling and verify signature,
    issuer, audience, and expiry as appropriate.
-   Authentication (who the user is) and authorization (what the user
    may do) are separate checks.
-   Enforce authorization on the server for every protected resource;
    never trust a role or user ID supplied by the client.
-   Use Helmet and configure CORS with explicit trusted origins. Do not
    use unrestricted CORS with credentials.
-   Apply rate limits to login, password reset, OTP, and other
    abuse-prone endpoints.
-   Validate file uploads: size, type, filename, and storage location.
-   Protect against mass assignment by accepting only explicitly allowed
    fields.
-   Use HTTPS in deployed environments.
-   Keep dependencies updated and review security advisories.
-   Never log passwords, access tokens, refresh tokens, API keys, or
    sensitive personal data.
-   Use secure, HttpOnly, appropriately configured cookies if using
    cookie-based sessions.
-   Add CSRF protection when the authentication and cookie setup
    requires it.

## 11. Environment configuration and secrets

-   Keep secrets and environment-specific values outside source code.
-   Commit `.env.example` with placeholder values, never real
    credentials.
-   Add `.env` and other secret files to `.gitignore`.
-   Validate required environment variables at application startup with
    Zod.
-   Fail fast with a clear startup error if required configuration is
    missing.
-   Use separate credentials and databases for development, testing, and
    production.
-   Do not print the full environment object in logs.

Example `.env.example`:

``` dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/app_db
JWT_SECRET=replace_with_a_long_random_secret
CORS_ORIGIN=http://localhost:5173
```

These are placeholders only. Generate real secrets securely and never
commit them.

## 12. Logging and observability

-   Use structured logs (Pino) rather than scattered `console.log`
    statements in application code.
-   Include request IDs so a request can be traced across logs.
-   Log important lifecycle events and unexpected failures.
-   Use appropriate log levels: `debug`, `info`, `warn`, and `error`.
-   Avoid logging secrets, credentials, tokens, and unnecessary personal
    data.
-   Do not log every successful operation at error level.
-   Add health and readiness endpoints where appropriate. A readiness
    check should verify critical dependencies when needed.

## 13. Testing

Use a practical test pyramid:

-   **Unit tests:** Test business rules and individual functions without
    a real HTTP server or database when possible.
-   **Integration tests:** Test services/repositories against a test
    database and test HTTP routes with Supertest.
-   **End-to-end tests:** Test critical user workflows through the
    running application when the project needs them.

Guidelines:

-   Use Vitest for tests.
-   Test success cases, validation failures, authorization failures, and
    important edge cases.
-   Test that users cannot access another user's private resources.
-   Use isolated test data and clean it up.
-   Never run destructive tests against production.
-   Do not make tests depend on execution order.
-   Mock external services at the boundary; avoid mocking every internal
    function.
-   Fix the underlying issue when a test fails; do not weaken or delete
    a test merely to make the suite pass.

## 14. Performance and reliability

-   Use pagination and sensible request-size limits.
-   Avoid blocking the Node.js event loop with CPU-heavy synchronous
    work.
-   Use streams for large files where appropriate.
-   Set timeouts for outbound HTTP requests.
-   Retry only transient failures, with bounded attempts and backoff. Do
    not blindly retry non-idempotent operations.
-   Make payment and other critical operations idempotent where
    appropriate.
-   Close database connections and gracefully shut down the server on
    termination signals.
-   Add caching only after identifying a real performance need and
    defining invalidation behavior.
-   Use background jobs/queues for long-running tasks rather than
    keeping HTTP requests open unnecessarily.

## 15. Suggested npm scripts

Adapt these to the project's module system and installed tools:

``` json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Check the generated output and Node module configuration before relying
on the `start` command. Add database migration scripts appropriate to
the selected ORM.

## 16. Git and code review

-   Use clear, focused commits.
-   Do not commit `node_modules`, `dist`, `.env`, secrets, logs, or
    temporary files.
-   Keep pull requests/change sets focused.
-   Before considering work complete, run type checking, linting, tests,
    and build where available.
-   Review the final diff for unrelated changes, debug statements,
    accidental secrets, and generated files.
-   Explain any command that could delete data, reset a database, or
    change production infrastructure before running it.

## 17. Instructions for Claude when working in this repository

Before implementing a task:

1.  Inspect `package.json`, TypeScript configuration, folder structure,
    and existing conventions.
2.  Identify the relevant feature and follow its current architecture.
3.  Explain the intended change briefly if it affects multiple files or
    architecture.
4.  Reuse existing dependencies and utilities where appropriate.
5.  Ask before adding a new dependency if an existing package can
    reasonably solve the problem.
6.  Do not rewrite unrelated files or perform broad refactors for a
    small feature.
7.  Do not invent API contracts, database fields, environment variables,
    or business rules. Ask when essential requirements are unclear.

While implementing:

-   Write TypeScript that passes strict type checking.
-   Validate external input at boundaries.
-   Keep controllers thin and business logic in services/use cases.
-   Keep database access in the persistence layer.
-   Avoid circular imports and hidden side effects.
-   Handle errors and authorization explicitly.
-   Add tests for the behavior being changed.
-   Follow existing naming, formatting, and file organization.

Before finishing:

1.  Run the relevant tests.
2.  Run `npm run typecheck`, `npm run lint`, and `npm run build` if
    those scripts exist.
3.  Fix issues caused by the change.
4.  Summarize files changed, behavior added, commands run, and any
    remaining limitations.
5.  If a command could not be run, state that honestly; never claim it
    passed.

## 18. Keep the stack appropriate

These recommendations are defaults, not a requirement to install every
package. Start with the smallest set that solves the current problem.
Prefer maintained packages with active releases, clear documentation,
TypeScript support, and a healthy security history. Check current
compatibility and official documentation before adding or upgrading a
major dependency.
