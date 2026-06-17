# BillSplAIt

BillSplAIt is a bill-splitting web application with an Express backend and an Angular frontend.

## Project structure

- `backend/` — Express server, Sequelize models, JWT auth, Jest tests
- `frontend/` — Angular app, Material-ready UI, auth guard, typed API service

## Prerequisites

- Node.js (18+), npm
- Docker & Docker Compose (for running Postgres + pgAdmin)

## Quick start

There are two common workflows:

- Run the database in Docker and run the backend and frontend locally (recommended for development).
- Run everything with Docker Compose (optional) — this repo keeps backend runnable locally by default.

### 1) Run DB services (Docker Compose)

Start only the database and pgAdmin services:

```bash
cd "$(pwd)"
docker compose up -d db pgadmin
```

This exposes:
- Postgres: `localhost:5432`
- pgAdmin: http://localhost:5050 (login with the credentials in `docker-compose.yml`)

### 2) Configure backend environment

Create or review `backend/.env` (an example exists at `backend/.env.example`). Important variables:

- `PORT` — backend port (default `4000`)
- `JWT_SECRET` — secret for signing JWTs
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` — Postgres connection

When running the backend locally while Postgres runs in Docker Compose on the same machine, set `DB_HOST=localhost` in `backend/.env`.

### 3) Run backend locally

```bash
cd backend
npm install
npm run dev
```

The backend listens on `http://localhost:4000` by default. Verify the server health:

```
GET http://localhost:4000/api/health

expected response: { "status": "ok", "message": "BillSplAIt backend is healthy" }
```

### Backend API Docs (Swagger)

Once the backend is running, interactive API docs are available at:

```
http://localhost:4000/api/docs
```

The raw OpenAPI spec (JSON) is at:

```
http://localhost:4000/api/docs.json
```

Endpoints that require authentication show a padlock icon in the UI. Use the **Authorize** button and enter `Bearer <your_jwt_token>` to test protected routes.

### 4) Run frontend locally

```bash
cd frontend
npm install
npx ng serve --open
```

The frontend runs at `http://localhost:4200` and talks to the backend at the URL configured in `frontend/src/environments/environment.ts` (default `http://localhost:4000/api`).

### 5) Run everything with Docker Compose (optional)

If you prefer to run backend in Docker too, you can extend the Compose file to include a backend service. This repository currently keeps the backend runnable locally for development. To run everything in Compose, add a backend service and a Dockerfile, then:

```bash
docker compose up --build
```

### 6) Tests

Backend unit/integration tests (Jest + Supertest):

```bash
cd backend
npm test
```

Frontend tests (Jest):

```bash
cd frontend
npm test
```

## Notes

- If ports `4000` or `4200` are already in use, change `PORT` in `backend/.env` or the Angular dev server port.
- If you run backend in Docker, set `DB_HOST=db` (the service name) in the backend env.
- Keep `backend/.env` out of source control — it contains secrets.

If you want, I can add a ready-to-run `docker-compose` variant that includes the backend container. 
