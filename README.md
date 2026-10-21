# CampusConnect — Campus Event Management

CampusConnect is a full-stack application for discovering and managing college clubs and events. Students can register for events and submit club applications. Once an administrator approves a club, its creator becomes the club manager and can manage that club's events.

## Features

- Browse published campus events and approved clubs
- Register for events and view registrations
- Apply to create a club, including its type, branches, description, and image
- Admin dashboard to review club applications and manage clubs and events
- Club manager tools to create and manage events for an approved club
- Optional event poster or advertisement image uploads
- JWT-based authentication with student, manager, and admin roles
- OpenAPI/Swagger API documentation

## Technology

| Part | Technology |
| --- | --- |
| Frontend | React 19, Vite 7, JavaScript, CSS |
| Backend | Java 21, Spring Boot, Spring Security, Spring Data JPA |
| Database | MySQL |
| Authentication | JWT |

## Project structure

```text
campus-event-management/
├── campus-event-frontend/    # React + Vite application
└── campus-event-management/  # Spring Boot REST API
```

## Run locally

### Requirements

- Java 21
- Node.js and npm
- MySQL

### 1. Prepare MySQL and backend configuration

Create a MySQL database for the application and make sure its tables match the backend entities. Hibernate is configured with `ddl-auto=validate`, so it checks the schema but does not create or update tables. The repository includes the V2 migration at `campus-event-management/database/migration/V2__club_details_and_event_images.sql`; apply it to an existing database if that schema has not yet been updated.

The local database credentials and JWT secret are intentionally not included in Git. Create `campus-event-management/src/main/resources/application-local.properties` on your computer with your local values:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/YOUR_DATABASE_NAME
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
jwt.secret=YOUR_LONG_RANDOM_SECRET
```

Keep this file private; it is excluded from Git. Replace the example values before running the app.

### 2. Start the backend

In PowerShell:

```powershell
cd campus-event-management
\.\mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8080`. Swagger UI is available at `http://localhost:8080/swagger-ui/index.html`.

### 3. Start the frontend

Open another terminal:

```powershell
cd campus-event-frontend
npm install
npm run dev
```

Open the local address printed by Vite (usually `http://localhost:5173`). The frontend uses `http://localhost:8080/api` by default. To point it to a different API, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

To create a production frontend build, run `npm run build`; the output is written to `campus-event-frontend/dist`.

## Main API routes

All routes use the `/api` prefix. Examples include:

- `/auth` — registration, login, and current-user details
- `/clubs` — browse, submit, and manage clubs
- `/events` — published events and event management
- `/events/{eventId}/register` — register for an event
- `/student/registrations` — view a student's registrations
- `/admin/dashboard` — admin dashboard data
- `/admin/clubs/pending` — pending club applications
- `/media/images` — upload an image

See Swagger UI for request formats, responses, and authorization details.

## Configuration reference

The backend reads these environment variables when running outside the local profile:

| Variable | Purpose |
| --- | --- |
| `SPRING_DATASOURCE_URL` | JDBC URL for MySQL |
| `SPRING_DATASOURCE_USERNAME` | MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | MySQL password |
| `JWT_SECRET` | Secret used to sign JWTs |
| `PORT` | Backend port (defaults to `8080`) |
| `APP_UPLOAD_DIR` | Image upload directory (defaults to `uploads`) |

Do not commit passwords, signing secrets, real user data, or uploaded media.

## License

No license has been selected for this repository yet.
