# Skill: Create Express Feature

When implementing a backend feature:
1. Create a route file in routes/
2. Create a controller in controllers/
3. Create a service in services/
4. Update Sequelize models if needed
5. Add validation middleware if needed
6. Ensure all logic is in the service
7. Ensure controller is thin
8. Write Jest + Supertest tests
9. Add a JSDoc `@openapi` annotation above every `router.<method>()` call in the route file
	- Follow the OpenAPI 3.0 format used in the existing route files
	- Include `tags`, `summary`, `security` (bearerAuth if auth-protected), `parameters`, `requestBody`, and `responses`
	- Reference shared schemas from `backend/src/config/swagger.js` via `$ref` where possible
	- If a new response shape is needed, add its schema to `backend/src/config/swagger.js` under `components.schemas`
