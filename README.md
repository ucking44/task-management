# Task Management System (NestJS)

A scalable, production-ready Task Management System built with NestJS, PostgreSQL, and TypeORM. This project demonstrates modular architecture, security best practices, clean code patterns, and robust REST API design.

---

## Features

* Modular architecture (User, Auth, Task modules)
* Role-based access control (ADMIN, USER)
* JWT authentication (login, logout, refresh)
* Secure password hashing with bcrypt
* Redis caching (user session, user lookup)
* Custom decorators (e.g. `@Roles`)
* Custom guards for RBAC enforcement
* API documentation using Swagger/OpenAPI
* Full DTO validation with `class-validator`
* Pagination and filtering for tasks
* TypeORM with custom repositories
* PostgreSQL integration via Docker Compose
* Migrations using TypeORM CLI
* Soft delete support for tasks
* CORS and security headers (Helmet)
* Rate limiting
* Unit and integration tests using Jest

---

## Tech Stack

* **Backend Framework**: NestJS
* **Database**: PostgreSQL
* **ORM**: TypeORM
* **Caching**: Redis
* **Auth**: JWT
* **Containerization**: Docker & Docker Compose
* **Validation**: class-validator
* **API Docs**: Swagger
* **Testing**: Jest

---

## Architecture

* `AuthModule`: Handles login, logout, token refresh, guards, and decorators
* `UserModule`: User CRUD, roles, password security, RBAC
* `TaskModule`: Full task lifecycle with advanced filtering and authorization
* Custom Repositories: Abstract DB operations
* Services: Business logic separated cleanly
* DTOs: Input validation and data transfer standardization
* Guards and Decorators: Enforce security at route level

---

## Installation

```bash
git clone https://github.com/your-username/task-management-api.git
cd task-management-api
docker-compose up --build
```

Ensure you have a `.env` file at the root:

```env
POSTGRES_DB=taskdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s
REDIS_HOST=redis
REDIS_PORT=6379
```

Run migrations:

```bash
docker exec -it task-management-api npm run typeorm migration:run
```

---

## Authentication

* **Login**: `POST /auth/login`
* **Logout**: `POST /auth/logout`
* JWT access token returned on login
* Passwords are hashed with bcrypt
* Refresh token support is available (optional)

---

## Authorization (RBAC)

* **ADMIN**: Can manage users and view all tasks
* **USER**: Can manage own tasks only
* Implemented with `@Roles` decorator and custom `RolesGuard`

---

## API Endpoints

### Auth

* `POST /auth/login`
* `POST /auth/logout`

### Users

* `GET /users` (ADMIN only)
* `GET /users/:id`
* `POST /users` (ADMIN only)

### Tasks

* `GET /tasks` (filter by status/priority, pagination)
* `GET /tasks/:id`
* `POST /tasks`
* `PATCH /tasks/:id`
* `DELETE /tasks/:id`

---

## Advanced Features

* **Pagination**: `?page=1&limit=10`
* **Filtering**: `?status=TODO&priority=HIGH`
* **Redis Caching**: User lookup and session
* **Soft Deletes**: Tasks are soft-deletable
* **Custom Decorator**: `@Roles('ADMIN')`
* **Security Headers**: Helmet
* **Rate Limiting**: Global interceptor

---

## Performance

* Indexed fields for filtering (status, priority)
* Optimized queries using relations
* Redis cache layer for frequently accessed users

---

## Testing

* **Jest** unit tests for services with mocking
* **Integration tests** for API endpoints
* **Coverage**: 70%+ across service and controller layers
* Tests for auth flows, error cases, and edge scenarios

```bash
npm run test
npm run test:cov
```

---

## Docker Setup

```bash
docker-compose up --build
```

Ports:

* App: [http://localhost:3000](http://localhost:3000)
* Postgres: 5432
* Redis: 6379

---

## Swagger Docs

Available at:

```
http://localhost:3000/api
```

Includes:

* DTO schemas
* Auth token input
* Example responses

---

## Migrations And Seeder

```bash
npm run typeorm migration:generate -- -n Init
npm run typeorm migration:run
npm run seed

```

---

## Scripts

```bash
npm run start:dev        # Start in dev mode
npm run test             # Run unit tests
npm run test:cov         # Run coverage
npm run build            # Build project
npm run migration:run    # Run migrations
```

---

## Author

Built by \[Uchechukwu Ogbuleke] - \[[uchechukwu.ogbuleke@email.com]]

---

## License

This project is licensed under the MIT License.
