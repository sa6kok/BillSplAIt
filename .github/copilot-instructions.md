# GitHub Copilot – Project Instructions (Bill Splitting App - the name is BillSplAItt)

## Project Overview
This repository contains a bill-splitting web application similar to Splitwise.

### Tech Stack
- Backend: Node.js + Express (JavaScript)
- Frontend: Angular (TypeScript)
- Database: PostgreSQL (Docker)
- ORM: Sequelize
- Auth: JWT
- Dev OS: Windows (backend + frontend run locally, DB in Docker)
- Future: React frontend must be able to replace Angular without backend changes

---

## Global Architecture Rules
1. The backend exposes a clean REST API only.
2. All business logic must live in backend services, not controllers.
3. Angular must contain no business logic — only UI + API calls.
4. All API calls must go through a single Angular service layer.
5. Code must follow the folder structures defined in COPILOT_PLAN.md.
6. Backend and frontend must remain decoupled.
7. Future React migration must require zero backend changes.

---

## Backend Coding Rules
- Use Express Router for all routes.
- Controllers must be thin.
- Services contain all business logic.
- Use async/await.
- Use JWT for authentication.
- Use bcrypt for password hashing.
- Use Sequelize models with associations.
- Use environment variables.
- Use middleware for auth and error handling.

---

## Frontend Coding Rules (Angular)
- Use Angular services for all API calls.
- Use HttpClient with typed interfaces.
- Use Angular Material for UI components.
- Use reactive forms.
- Use guards for route protection.
- Use interceptors to attach JWT tokens.
- Keep components dumb (UI only).
- Keep each Angular component in its own folder (for example `src/app/features/expenses-list/`).
- Use separate files per component: `.component.ts`, `.component.html`, `.component.css`.
- Use `.component.spec.ts` in the same folder when tests are required.
- Do not use inline `template` or inline `styles` in component decorators.

---

## Database Rules
- Use Sequelize migrations.
- Models: User, Group, GroupMember, Expense, ExpenseShare.
- Use foreign keys and associations.
- Never embed business logic in models.

---

## Testing Rules
- Backend: Jest + Supertest + SQLite in-memory
- Frontend: Jest + Angular Testing Library
- Tests must be created during each phase, not at the end.
- Use AAA pattern (Arrange, Act, Assert).
- Tests must be deterministic.

---

## Copilot Behavior Rules
- Always follow the architecture and folder structure.
- When generating code, place files in the correct directories.
- When asked to implement a feature, generate:
  - route
  - controller
  - service
  - model changes (if needed)
  - Angular service method
  - Angular component logic (if requested)
  - tests for backend and frontend
- Never mix backend and frontend code.

## API Documentation Rules
- Every new backend route handler MUST include a JSDoc `@openapi` annotation directly above the `router.<method>()` call in the route file.
- Annotations must follow the OpenAPI 3.0 format already used in `backend/src/routes/*.js`.
- Each annotation must include: `tags`, `summary`, `security` (bearerAuth when the route uses authMiddleware), `parameters` (if path/query params exist), `requestBody` (if the route accepts a body), and `responses` (at minimum 200/201 and 401 where applicable).
- Request/response schemas must reference shared `$ref: '#/components/schemas/...'` types defined in `backend/src/config/swagger.js` or declare inline schemas.
- If a new model or response shape is introduced, add its schema to `backend/src/config/swagger.js` under `components.schemas`.
- Do not add Swagger annotations to controllers, services, or middleware — route files only.
- Never create business logic in Angular.
- Always keep code modular and clean.
