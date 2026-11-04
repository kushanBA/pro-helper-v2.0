# PRO HELPER 2.0 — Product Requirements and Build Guide

> **Purpose of this file:** Give Claude Code the product context and implementation requirements for building the Pro Helper 2.0 backend.
>
> **Important:** This document describes the product and its intended behavior. Follow the separate `CLAUDE.md` for coding standards, architecture, security, packages, and development workflow.
>
> **Current target stack**
> - Mobile client: Flutter (separate application/repository unless the existing workspace says otherwise)
> - Backend: Node.js + TypeScript + Express.js
> - Database: PostgreSQL
> - Authentication: custom JWT-based authentication
> - ORM: use the ORM already selected in the repository. If none exists, ask before choosing Prisma or Drizzle.
>
> Do not silently change this stack.

---

## 1. Product overview

**Pro Helper 2.0** is a service-provider marketplace that connects customers who need a service with suitable service providers.

Examples of services may include plumbing, electrical work, appliance repair, and other home or technical services. The platform should support different service categories rather than being hard-coded for one trade.

The product is being rebuilt from scratch. Its main differentiator is not simply listing nearby providers. It helps customers describe a job clearly, understand why providers are recommended, and assess quotes against the confirmed job requirements.

### Core product problems

1. Customers may not know how to describe a job accurately.
2. Incomplete job descriptions can lead to unsuitable providers or misunderstandings.
3. Customers need to understand why a provider is recommended.
4. Quotes can be difficult to compare when providers make different assumptions about the work.
5. Customers and providers need a clear record of the agreed job scope and quote.

### Main product capabilities

- Customer and provider accounts.
- Provider profiles, skills, service categories, service areas, and availability information.
- AI-assisted job scoping and clarification.
- Explainable provider matching and ranking.
- Provider quotations and quote evaluation against confirmed requirements.
- Booking and job-status tracking.
- Customer-provider communication and notifications.
- Reviews, trust, and administrative capabilities.
- Research and data-quality support for evaluating the system.

---

## 2. Product goals

The system should:

- Help customers turn an unclear request into a structured job description.
- Ask useful follow-up questions when essential job information is missing.
- Let customers review and confirm the structured job requirements before matching.
- Rank providers using relevant job requirements and provider information.
- Explain the important reasons behind each provider recommendation.
- Allow providers to submit quotations based on the confirmed job scope.
- Help customers understand and compare quotations.
- Preserve the confirmed requirements and accepted quote as a reference for the job.
- Provide a traceable workflow from job creation through completion and review.

## 3. User roles

### 3.1 Customer

A customer should be able to:

- Register, sign in, and manage their account.
- Create a service request.
- Describe the problem in natural language.
- Answer clarification questions generated during job scoping.
- Review and edit the structured job requirements.
- Confirm the job requirements before provider matching.
- View ranked provider recommendations.
- Understand why each provider was recommended.
- View provider profiles.
- Receive and compare provider quotations.
- Accept or reject a quotation.
- Track a booking/job.
- Communicate with the provider.
- Receive relevant notifications.
- Submit a review after a completed job.

### 3.2 Service provider

A service provider should be able to:

- Register, sign in, and manage their account.
- Create and update a provider profile.
- Add skills, service categories, experience, service areas, and relevant profile information.
- Manage availability where supported by the product.
- View job requests that are made available to them.
- Review the confirmed job requirements.
- Submit a quotation with a price and supporting details.
- Update a quotation only while the workflow permits it.
- Accept or reject a booking/request where that action is part of the defined workflow.
- Track assigned jobs and update permitted job statuses.
- Communicate with the customer.
- Receive relevant notifications.
- View customer feedback and their own reviews.

### 3.3 Administrator

Administrative capabilities should support platform trust and operation. Depending on the final admin workflow, an administrator may:

- View and manage customer and provider accounts.
- Review reported or inappropriate content.
- Handle provider verification or account-status decisions if verification is enabled.
- Review service categories and platform configuration.
- Review reported jobs, quotations, or user activity when necessary.
- Monitor platform-level data quality.

Do not invent detailed admin permissions. Define authorization rules explicitly before implementing sensitive admin actions.

---

## 4. Main end-to-end workflows

### Workflow A — Account creation and authentication

1. A customer or provider registers.
2. The backend validates the submitted data.
3. The backend creates the account with the correct role and secure password hash.
4. The user signs in.
5. The backend issues and validates JWT-based authentication credentials.
6. Protected endpoints identify the authenticated user from the verified token.
7. Authorization checks ensure users can only access resources they are allowed to access.

Requirements:
- Never trust a role or user ID sent in a request body as proof of identity.
- Keep authentication and authorization separate.
- Do not store plain-text passwords.
- Do not expose password hashes or sensitive authentication data in API responses.

### Workflow B — Provider profile setup

1. A provider completes their profile.
2. The provider adds relevant skills and service categories.
3. The provider specifies service coverage/location information.
4. The provider supplies other relevant information, such as experience and availability, where supported.
5. The backend validates and stores the profile.
6. The profile becomes eligible for matching according to the platform's defined eligibility rules.

Matching must use structured provider information. Do not infer a provider's skill or eligibility from unrelated profile text alone.

### Workflow C — AI-assisted job scoping

1. The customer submits a natural-language description of the required service.
2. The backend sends the description to the configured AI integration.
3. The AI assists in identifying the likely service category and extracting structured job details.
4. The system identifies missing or ambiguous information that could affect provider suitability or quotation accuracy.
5. The system asks the customer relevant clarification questions.
6. The customer answers, edits, or rejects suggested details.
7. The backend updates the structured job draft.
8. The customer reviews and explicitly confirms the final requirements.
9. Only the confirmed requirements are used for provider matching and quote evaluation.

Important rules:
- AI output is a suggestion, not an unquestionable fact.
- The customer must be able to review and correct AI-generated details.
- Do not silently invent measurements, materials, urgency, location, or other job facts.
- Preserve the original customer description as well as the structured version.
- Keep track of whether a job is a draft, awaiting clarification, or confirmed.
- Do not start final matching before the customer confirms the requirements.
- If the AI service is unavailable, return a controlled error or provide a clearly defined non-AI fallback. Do not pretend AI processing succeeded.

### Workflow D — Explainable provider matching

1. The customer has confirmed the job requirements.
2. The backend identifies providers who meet essential eligibility conditions.
3. The matching process evaluates suitable providers using relevant job and provider attributes.
4. The backend produces a ranked result.
5. Each result includes understandable reasons supporting the recommendation.
6. The customer can inspect provider profiles and decide whom to contact or request a quotation from.

Matching design principles:
- Separate **eligibility filtering** from **ranking**.
- Essential requirements should not be hidden inside a vague overall score.
- Use only data relevant to the confirmed job and provider suitability.
- Do not claim that a provider is suitable when required information is missing.
- Make the ranking explainable: return the meaningful factors that contributed to the result.
- Keep the ranking logic on the backend so clients cannot manipulate scores.
- Store enough matching information to support debugging and research evaluation.
- Do not present a score as a probability unless it has been designed and validated as one.

Potential matching factors, subject to the approved matching specification:
- Skill/category compatibility.
- Service-area/location compatibility.
- Experience relevant to the requested work.
- Availability, if reliable availability data exists.
- Other explicitly approved provider attributes.

Do not invent weights, thresholds, or a scoring formula. Keep these configurable and document the approved method before implementing it.

### Workflow E — Quotations and quote evaluation

1. A provider reviews the confirmed job requirements.
2. The provider submits a quotation.
3. The quotation contains the price and the details required by the approved quote format.
4. The customer can view quotations for the same confirmed job.
5. The system evaluates or summarizes each quotation against the confirmed requirements.
6. The customer can understand what is included, what is excluded, and which details need clarification.
7. The customer chooses whether to accept or reject a quotation.
8. The accepted quotation becomes the agreed reference for the booking/job.

Quote evaluation principles:
- Compare quotations against the same confirmed job requirements.
- Do not rank a cheaper quote as automatically better.
- Clearly distinguish provider-supplied facts from AI-generated analysis.
- Identify missing information and possible mismatches instead of making unsupported claims.
- Do not alter a provider's submitted price or terms.
- Keep the original quotation available for audit and dispute resolution.
- If a quote is revised, retain a clear version/history or audit trail.
- Do not implement automated price negotiation unless a later approved requirement explicitly asks for it.

### Workflow F — Booking and job tracking

1. The customer accepts a quotation.
2. The backend validates that the quotation belongs to the job and is still eligible for acceptance.
3. The system creates or updates the booking/job according to the agreed workflow.
4. The customer and provider can view the job status.
5. Authorized participants can update permitted statuses.
6. The system records important status changes with timestamps and actor information.
7. After completion, the customer can submit a review if review conditions are met.

Define allowed status transitions explicitly. Do not allow arbitrary status changes from the client.

### Workflow G — Communication and notifications

- Customers and providers should be able to communicate in the context of a job.
- Users should receive relevant notifications for important events such as quotations, booking updates, and messages.
- Users must only access conversations and notifications they are authorized to see.
- Notification delivery should not be treated as proof that a user has read or acted on a message.
- Avoid duplicate notifications when a request is retried.
- Use a background job mechanism only if the actual delivery requirements justify it.

### Workflow H — Reviews and trust

- Reviews should be associated with a legitimate completed job.
- Enforce the approved rule for who may review whom and when.
- Prevent duplicate reviews for the same review opportunity.
- Store ratings and written feedback with timestamps.
- Provide a way to report inappropriate reviews or content if that capability is included in the approved admin scope.
- Do not allow users to edit another user's review.

---

## 5. Functional modules

Build the backend as clear modules. The names below are conceptual; follow existing repository conventions.

| Module | Main responsibility |
|---|---|
| Authentication | Registration, login, token handling, password security |
| Users | Account details and role-aware account management |
| Provider profiles | Skills, categories, service areas, experience, profile information |
| Service categories | Manage supported service types |
| Job scoping | Job drafts, AI extraction, clarification questions, customer confirmation |
| Matching | Eligibility filtering, ranking, explanation of recommendations |
| Quotations | Provider quote submission, updates, customer decisions |
| Quote evaluation | Compare quote details with confirmed job requirements |
| Bookings/jobs | Accepted work, status transitions, history |
| Communication | Job-related messages and conversation access |
| Notifications | In-app or configured notification delivery |
| Reviews | Ratings, feedback, and review eligibility |
| Administration | Approved platform-management and moderation actions |
| Research/audit | Traceability and data needed to evaluate system behavior |

Do not build all modules in one large file. Keep each module cohesive and avoid unnecessary coupling.

---

## 6. Core data concepts

The following are conceptual entities, not a final database schema. Inspect the existing repository and any approved ER diagram/schema before creating migrations. Do not duplicate existing entities or invent fields without a reason.

Likely entities include:

- **User:** account identity, credentials, role, account status, timestamps.
- **CustomerProfile:** customer-specific profile information, if separate from User.
- **ProviderProfile:** provider information, experience, service coverage, profile status.
- **ServiceCategory:** supported service categories.
- **ProviderSkill:** relationship between a provider and a skill/category, including proficiency or experience only if defined.
- **ProviderAvailability:** provider availability, if the product requires it.
- **Job:** customer request, original description, structured requirements, status, timestamps.
- **JobClarification:** a question and its answer or response state.
- **JobRequirement:** structured requirement data, if a normalized representation is needed.
- **MatchResult:** provider candidate, rank/score, matching factors, explanation, matching version/time.
- **Quotation:** provider's submitted offer for a job, price, terms, status, timestamps.
- **QuoteEvaluation:** structured comparison findings, missing details, warnings, and evaluation version.
- **Booking:** accepted job/quotation relationship and agreed details.
- **JobStatusHistory:** status transition, actor, timestamp, and optional reason.
- **Conversation:** job-related conversation participants.
- **Message:** sender, conversation, content, timestamp, read state if required.
- **Notification:** recipient, type, payload/reference, delivery/read state as required.
- **Review:** eligible reviewer, review target, job, rating, comment, timestamp.
- **AuditLog:** important security- or business-sensitive actions, where required.

Data design requirements:
- Use primary keys and foreign keys consistently.
- Add unique constraints for genuine uniqueness rules.
- Add indexes for common filtering, joins, and sorting after considering query patterns.
- Store monetary values using an exact decimal representation, not floating-point arithmetic.
- Store timestamps consistently in UTC.
- Define deletion behavior deliberately, especially for jobs, quotations, messages, and audit records.
- Use database transactions for operations that must succeed or fail together.
- Keep a history for important decisions and status changes.

---

## 7. AI integration requirements

AI is used to assist job scoping and quote evaluation. It must not become the source of truth for user decisions or provider-submitted information.

### Job-scoping AI

The integration should:
- Accept the customer's original description and relevant conversation context.
- Return structured data matching a validated schema.
- Identify uncertain or missing information.
- Generate concise, relevant clarification questions.
- Avoid assuming facts not supplied by the customer.
- Allow the customer to edit and confirm the final result.

### Quote-evaluation AI

The integration should:
- Receive the confirmed job requirements and provider quotation details.
- Identify included and excluded work where the quote makes this clear.
- Highlight missing information and possible requirement mismatches.
- Explain findings in neutral language.
- Distinguish evidence from uncertainty.
- Never modify the original quote or make the acceptance decision for the customer.

### AI engineering rules

- Keep provider credentials in environment variables or a secure secret store.
- Put AI calls behind a dedicated service/adapter.
- Validate AI responses with Zod before using or storing them.
- Treat AI output as untrusted input.
- Handle timeouts, rate limits, malformed responses, and provider outages.
- Avoid sending unnecessary personal data to an AI provider.
- Record the model/provider and prompt/schema version when needed for reproducibility and research.
- Do not hard-code a specific AI vendor or model until it is selected.
- Do not claim an AI result is accurate without evaluation.

---

## 8. API design expectations

Use versioned REST endpoints, for example `/api/v1/...`, unless the existing project has an established convention.

Potential resource groups:

```text
/api/v1/auth
/api/v1/users
/api/v1/providers
/api/v1/service-categories
/api/v1/jobs
/api/v1/jobs/:jobId/clarifications
/api/v1/jobs/:jobId/confirm
/api/v1/jobs/:jobId/matches
/api/v1/jobs/:jobId/quotations
/api/v1/quotations/:quotationId
/api/v1/quotations/:quotationId/evaluation
/api/v1/jobs/:jobId/booking
/api/v1/bookings
/api/v1/conversations
/api/v1/messages
/api/v1/notifications
/api/v1/reviews
/api/v1/admin
```

These are illustrative route groups, not permission to implement every endpoint immediately. Confirm request/response contracts and authorization rules for each endpoint.

API requirements:
- Validate path parameters, query parameters, and request bodies.
- Use appropriate HTTP status codes.
- Use pagination for list endpoints.
- Return consistent success and error formats.
- Do not expose internal stack traces or sensitive fields.
- Enforce object-level authorization: a user must not access another user's job, quote, booking, or conversation by guessing an ID.
- Document endpoints with OpenAPI.
- Keep controllers thin and business rules in application services/use cases.

---

## 9. Authorization rules

Implement authorization on the backend, not only in the Flutter UI.

At minimum, consider these rules:

- A customer can manage their own account and view their own jobs.
- A provider can manage their own provider profile and view jobs/quotes made available to them.
- A provider can only submit a quotation as themselves.
- A customer can only accept or reject quotations for a job they own.
- Only authorized job participants can access job conversations.
- Only eligible users can create reviews for completed jobs.
- Administrative actions require an explicitly authorized admin role/permission.
- Users cannot change their role by editing a request payload.
- Every resource lookup involving private data must include ownership/participation checks.

These are baseline rules. Refine them against the final product workflow before implementation.

---

## 10. Non-functional requirements

### Security and privacy
- Passwords must be securely hashed.
- JWTs must be verified correctly, including expiry and relevant claims.
- Validate and sanitize external input appropriately.
- Apply rate limits to sensitive endpoints.
- Keep secrets out of source control and logs.
- Use least-privilege database credentials.
- Restrict CORS to approved origins.
- Avoid exposing personal information unnecessarily.
- Keep authorization checks close to the resource access/use case.

### Reliability
- Handle expected errors consistently.
- Use transactions for multi-step critical operations.
- Add timeouts and bounded retry behavior for external services.
- Make retry-sensitive operations idempotent where appropriate.
- Log important failures with request/correlation IDs.

### Maintainability
- Use TypeScript strict mode.
- Keep modules cohesive and dependencies one-directional.
- Avoid circular dependencies.
- Keep AI, database, and notification integrations behind clear boundaries.
- Add tests for important business rules.
- Maintain API documentation and database migrations.

### Performance
- Paginate potentially large result sets.
- Add indexes based on actual query patterns.
- Avoid N+1 database queries.
- Avoid CPU-heavy work in the request event loop.
- Use background processing for genuinely long-running work.

---

## 11. Testing and acceptance expectations

For each feature, include tests for:
- Successful behavior.
- Invalid input.
- Unauthenticated access.
- Authenticated but unauthorized access.
- Missing or unavailable related resources.
- Relevant boundary conditions.
- External integration failure where applicable.

Important product-level scenarios:

1. A customer cannot confirm a job with required unresolved information.
2. A customer can review and correct AI-suggested job details.
3. Matching cannot run against an unconfirmed job.
4. A provider who does not meet essential eligibility conditions is not presented as eligible.
5. A match result includes an explanation grounded in actual provider/job data.
6. A provider cannot submit a quotation on behalf of another provider.
7. A customer cannot accept a quotation for another customer's job.
8. Quote evaluation does not modify the original provider quotation.
9. Only an eligible customer can accept a quotation for their job.
10. Invalid job-status transitions are rejected.
11. Users cannot access conversations or messages for jobs in which they are not participants.
12. A review cannot be submitted for an ineligible or incomplete job.
13. AI or notification provider failures are handled without corrupting the job/quotation state.

Translate these scenarios into automated tests as the corresponding modules are implemented.

---

## 12. Research, explainability, and data quality

The project includes a research-oriented focus on explainable matching and AI-assisted workflows.

Preserve enough structured information to evaluate:
- Whether job scoping captured the customer's actual requirements.
- Which clarification questions were asked and answered.
- Whether customers changed AI-suggested details.
- Which eligibility rules were applied during matching.
- Which factors contributed to a provider's ranking.
- Whether quote evaluation identified missing or mismatched details.
- Whether users accepted or rejected recommendations and quotations, where this is collected appropriately.

Data collection must be purposeful and privacy-conscious:
- Do not collect sensitive data without a clear requirement.
- Do not store chain-of-thought or private internal reasoning from AI models.
- Store concise explanations, structured factors, versions, and outcomes instead.
- Make it possible to distinguish user-provided, provider-provided, system-derived, and AI-suggested information.
- Document missing data and limitations rather than filling gaps with invented values.

---

## 13. Implementation plan

Build incrementally. Do not generate the entire application in one unreviewed change.

### Phase 0 — Repository inspection and technical plan

- Inspect the repository and existing files.
- Confirm Node.js, TypeScript, Express, database, ORM, and module-system configuration.
- Identify what already exists and what is missing.
- Propose the folder structure and initial database design.
- List unresolved product decisions.
- Do not overwrite or delete existing work.

**Deliverable:** a short implementation plan and a list of questions/blockers.

### Phase 1 — Backend foundation

- Initialize or verify the TypeScript/Express application.
- Configure environment validation, logging, error handling, security middleware, and health endpoint.
- Configure PostgreSQL connection and migrations.
- Add linting, formatting, type checking, and test scripts.

**Acceptance:** the application starts locally, connects to the development database, and passes type checking and baseline tests.

### Phase 2 — Accounts and provider profiles

- Implement registration and login.
- Implement JWT verification and role-based authorization.
- Implement customer/provider account access.
- Implement provider profiles, skills, categories, and service coverage.

**Acceptance:** authentication and ownership/role restrictions are tested.

### Phase 3 — Job creation and AI-assisted scoping

- Implement job draft creation and editing.
- Implement structured job requirements.
- Add the AI adapter only after the provider/model and expected schema are agreed.
- Implement clarification questions and answers.
- Implement customer review and confirmation.

**Acceptance:** confirmed job requirements are validated and persisted; AI output cannot silently confirm a job.

### Phase 4 — Explainable matching

- Define and document eligibility rules.
- Define and document ranking factors and weights/logic with the project owner.
- Implement matching and explanation output.
- Add tests for eligibility, ranking, and explanation correctness.

**Acceptance:** results are reproducible for the same inputs and matching version, and explanations reflect the actual factors used.

### Phase 5 — Quotations and quote evaluation

- Implement provider quotation submission and permitted updates.
- Implement customer quotation listing and decisions.
- Define the quote-evaluation schema and AI adapter behavior.
- Preserve original quote content and evaluation history.

**Acceptance:** quote evaluation is advisory, traceable, and cannot change a provider's quote or accept it for the customer.

### Phase 6 — Booking, communication, and notifications

- Implement booking creation from an eligible accepted quotation.
- Define valid job-status transitions.
- Implement job-related communication and access checks.
- Add the selected notification channel(s).

**Acceptance:** only authorized participants can access and update their jobs and conversations.

### Phase 7 — Reviews, administration, and quality

- Implement review eligibility and submission.
- Implement only the agreed admin capabilities.
- Add audit events for important actions.
- Expand integration and end-to-end tests.
- Review performance, security, and API documentation.

**Acceptance:** critical workflows are tested and unauthorized actions are rejected.

---

## 14. Decisions that must not be guessed

Before implementing the relevant feature, ask the project owner or inspect an approved project document for these decisions if they are not already defined:

1. Exact customer/provider registration fields and verification requirements.
2. Whether one account can have both customer and provider roles.
3. Service categories and the provider skill taxonomy.
4. Location representation and service-area/radius rules.
5. Required job fields for each service category.
6. AI provider/model and deployment constraints.
7. The exact structured output schema for job scoping.
8. Matching eligibility rules, factors, scoring method, and weights.
9. Quote fields, price representation/currency, and revision rules.
10. Booking/job status list and allowed transitions.
11. Whether chat is real-time and which transport/provider is required.
12. Notification channels (in-app, push, email, or other).
13. Review rules and admin permissions.
14. Data retention, privacy, and research-consent requirements.
15. Deployment target and production infrastructure.

Use safe, documented defaults only for low-impact technical details. Do not invent product behavior for these decisions.

---

## 15. Instructions to Claude Code

You are helping build **Pro Helper 2.0**, not a generic CRUD tutorial.

When the user asks for a feature:

1. Read this file and the repository's `CLAUDE.md`.
2. Inspect the actual codebase before proposing changes.
3. Identify the relevant module, existing patterns, and dependencies.
4. Check whether the request conflicts with a product rule in this document.
5. If a critical product decision is missing, ask a concise question instead of inventing an answer.
6. Propose a small implementation plan for multi-file or architectural changes.
7. Implement only the requested scope; do not build unrelated features.
8. Add or update tests and API documentation where appropriate.
9. Run type checking, linting, tests, and build scripts that exist.
10. Summarize what changed, which files changed, commands run, and any remaining decisions.

### Strict instructions

- Do not implement the whole product in one massive code-generation step.
- Do not replace the agreed stack without permission.
- Do not invent business rules, scoring weights, AI behavior, or database fields.
- Do not use mock/static data as if it were production behavior.
- Do not expose secrets or sensitive data.
- Do not bypass authorization to make a demo work.
- Do not introduce circular dependencies.
- Do not claim tests or commands passed unless they were actually run.
- Prefer a working, tested vertical slice over many incomplete modules.

**Start by inspecting the repository and producing the Phase 0 technical plan. Do not start generating all modules immediately.**
