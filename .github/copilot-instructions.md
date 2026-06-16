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
- Never create business logic in Angular.
- Always keep code modular and clean.
