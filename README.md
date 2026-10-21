# 🎓 CampusConnect

**A single place to discover campus events, join clubs, and bring student activities to life.**

CampusConnect is a full-stack campus event management app. Students can explore and register for events or apply to create a club. Admins review club applications, and after approval, the club creator can manage the club and publish its events.

## ✨ What you can do

- **Discover events** — browse published events and register as a student.
- **Create clubs** — submit club details, including its type, branches, and an optional image.
- **Manage clubs** — admins review applications; approved creators become club managers.
- **Publish events** — club managers can create events and add an optional poster or advertisement image.
- **Manage access** — JWT authentication supports student, club manager, and admin roles.

## 🧰 Built with

| Frontend | Backend | Database & security |
| --- | --- | --- |
| React · Vite · JavaScript · CSS | Java 21 · Spring Boot · Spring Security | MySQL · JWT |

## 📁 Project layout

```text
campus-event-management/
├── campus-event-frontend/       # React + Vite app
└── campus-event-management/    # Spring Boot REST API
```

## 🚀 Run locally

### Prerequisites

- Java 21
- Node.js and npm
- MySQL

### 1. Configure the backend

Create a MySQL database and add your local settings to `campus-event-management/src/main/resources/application-local.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/YOUR_DATABASE_NAME
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
jwt.secret=YOUR_LONG_RANDOM_SECRET
```

Keep this file private; it is excluded from Git. The database must already contain the tables expected by the backend. The repository includes the V2 schema migration at `campus-event-management/database/migration/V2__club_details_and_event_images.sql`.

### 2. Start the backend

From PowerShell:

```powershell
cd campus-event-management
.\mvnw.cmd spring-boot:run
```

The API starts at `http://localhost:8080`. API documentation is available at `http://localhost:8080/swagger-ui/index.html`.

### 3. Start the frontend

Open a second terminal:

```powershell
cd campus-event-frontend
npm install
npm run dev
```

Open the local address shown by Vite, usually `http://localhost:5173`. The frontend uses `http://localhost:8080/api` by default. To use a different API address, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

## 🔐 Configuration

Never commit database passwords, JWT secrets, `.env` files, or uploaded media. Use private local settings for development and environment variables for deployment.
