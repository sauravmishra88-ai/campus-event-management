# CampusConnect

A campus event management app where students can discover events, register, and apply to create clubs. Admins review club applications, and approved club creators can manage their club's events.

## Tech stack

- React, Vite, JavaScript, CSS
- Java 21, Spring Boot, Spring Security
- MySQL and JWT authentication

## Run locally

Requirements: Java 21, Node.js with npm, and MySQL.

1. Create a MySQL database and configure the backend's local settings in `campus-event-management/src/main/resources/application-local.properties`:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/YOUR_DATABASE_NAME
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   jwt.secret=YOUR_LONG_RANDOM_SECRET
   ```

   Keep this local file private; it is excluded from Git. The database must already have the tables required by the backend. The included V2 migration is at `campus-event-management/database/migration/V2__club_details_and_event_images.sql`.

2. Start the backend in PowerShell:

   ```powershell
   cd campus-event-management
   .\mvnw.cmd spring-boot:run
   ```

3. In a second terminal, start the frontend:

   ```powershell
   cd campus-event-frontend
   npm install
   npm run dev
   ```

Open the local URL printed by Vite (usually `http://localhost:5173`). The backend runs at `http://localhost:8080`; API documentation is at `http://localhost:8080/swagger-ui/index.html`.
