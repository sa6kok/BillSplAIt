# BillSplAIt — Master Implementation Plan

## Status Legend
- ✅ Complete
- ⚠️ Partial
- ❌ Not Started

---

## Phase 0 — Project Initialization ✅
- Root `backend/` and `frontend/` folders created
- `docker-compose.yml` with PostgreSQL 16 + pgAdmin
- `backend/package.json` with Express, Sequelize, JWT, bcrypt, Jest, Supertest
- `frontend/package.json` with Angular 17, RxJS, Jest, jest-preset-angular
- `backend/.env` with DB/JWT config
- `backend/jest.config.js` and `frontend/jest.config.js`

---

## Phase 1 — Backend Foundation ✅
- `src/app.js` — Express app, CORS, body-parser, routes, error handler
- `src/index.js` — DB connect + server listen
- `src/config/index.js` — reads env vars, uses SQLite for tests
- `src/middleware/authMiddleware.js` — JWT Bearer validation
- `src/middleware/errorHandler.js` — global error handler
- `src/utils/jwt.js` — sign (7d expiry) + verify
- `config/config.js` — Sequelize CLI config (dev/test/prod)

---

## Phase 2 — Database Models ✅
Models with Sequelize associations:
- `User` — id, name, email, passwordHash
- `Group` — id, name, description, ownerId → User
- `GroupMember` — groupId, userId, role
- `Expense` — id, groupId, creatorId, description, amount, currency
- `ExpenseShare` — expenseId, userId, amount, paid
- `src/models/index.js` — registers all models and associations

---

## Phase 3 — Auth Module ✅
- `POST /api/auth/register` — validates, hashes password, returns user
- `POST /api/auth/login` — bcrypt compare, returns JWT
- `authService.js`, `authController.js`, `authRoutes.js`
- `tests/auth.test.js` — 3 tests (register, duplicate email, login)

---

## Phase 4 — Groups Module ✅
- `POST /api/groups` — create group, auto-add creator as owner
- `GET /api/groups` — list groups for authenticated user
- `GET /api/groups/:id` — get group with members (membership check)
- `PUT /api/groups/:id` — update name/description (owner only)
- `DELETE /api/groups/:id` — delete group (owner only)
- `POST /api/groups/:id/members` — add member by email (owner only)
- `DELETE /api/groups/:id/members/:memberId` — remove member (owner only)
- `tests/group.test.js` — 8 tests (CRUD + permission checks)

---

## Phase 5 — Expenses Module ✅
- `POST /api/expenses` — create expense with shares
- `GET /api/expenses/group/:groupId` — list expenses for group (membership check)
- `GET /api/expenses/:id` — get single expense with shares
- `PUT /api/expenses/:id` — update expense (creator only)
- `DELETE /api/expenses/:id` — delete expense + shares (creator only)
- `tests/expense.test.js` — 7 tests (CRUD + permission checks)

---

## Phase 6 — Balances Module ✅
- `GET /api/balances` — user's shares across all groups
- `GET /api/balances/group/:groupId` — per-user totals, paid, due for a group
- `balanceService.js` — `calculateBalances()` + `getGroupBalances()`
- `tests/balance.test.js` — 3 tests (user balances, group balances, correct amounts)

---

## Phase 7 — Angular Foundation ✅
- `app.module.ts` — BrowserModule, HttpClientModule, FormsModule, interceptor
- `app-routing.module.ts` — routes with AuthGuard
- `app.component.ts` — navbar shell with logout
- `environments/environment.ts` — apiUrl: http://localhost:4000/api

---

## Phase 8 — Angular Auth ✅
- `core/auth.service.ts` — register(), login()
- `core/api.service.ts` — get(), post(), put(), delete() wrappers
- `core/auth.guard.ts` — checks localStorage for auth_token
- `auth/auth.interceptor.ts` — adds Bearer token to all requests
- `auth/login.component.ts` — login form with styled card
- `auth/register.component.ts` — register form with styled card

---

## Phase 9 — Angular Groups UI ✅
- `core/group.service.ts` — createGroup, getGroups, getGroupById, updateGroup, deleteGroup, addMember, removeMember
- `features/groups-list.component.ts` — list groups, inline add-member, navigate to expenses/balances
- `features/create-group.component.ts` — create/edit group form
- Routes: `/groups`, `/groups/create`, `/groups/:id/edit`

---

## Phase 10 — Angular Expenses UI ✅
- `core/expense.service.ts` — createExpense, getGroupExpenses, getExpenseById, updateExpense, deleteExpense
- `features/expenses-list.component.ts` — list expenses per group
- `features/create-expense.component.ts` — create/edit expense with member split inputs
- Routes: `/groups/:groupId/expenses`, `/groups/:groupId/expenses/create`

---

## Phase 11 — Angular Balances UI ✅
- `core/balance.service.ts` — getUserBalances(), getGroupBalances()
- `features/balances.component.ts` — show per-user totals, paid, due
- Route: `/groups/:groupId/balances`

---

## Directory Structure

```
backend/
  config/
    config.js              # Sequelize CLI config
  migrations/
  src/
    app.js                 # Express app
    index.js               # Server entry point
    config/
      index.js             # Runtime config
      swagger.js           # OpenAPI docs
    controllers/           # Thin request handlers
    middleware/            # authMiddleware, errorHandler
    models/                # Sequelize models + associations
    routes/                # Express routers with OpenAPI annotations
    services/              # All business logic
    utils/
      jwt.js
  tests/                   # Jest + Supertest (SQLite in-memory)

frontend/
  src/
    app/
      app.module.ts
      app-routing.module.ts
      app.component.ts
      auth/                # login, register, guard, interceptor
      core/                # api.service, auth/group/expense/balance services
      features/            # groups-list, create-group, expenses-list,
                           # create-expense, balances components
    environments/
    styles.css
```

---

## Pending / Future Work
- ✅ Swagger/OpenAPI annotations on balance + expense routes
- ✅ Angular unit tests (Jest + Angular Testing Library) for all components
- ✅ Expense payers (who paid how much, not just who shares)
