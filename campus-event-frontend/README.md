# CampusConnect frontend

React and Vite frontend for the Campus Event Management API.

## Run locally

1. Start the Spring Boot backend on port `8080`.
2. From this folder, run `npm install` once.
3. Run `npm run dev` and open the local URL Vite prints (usually `http://localhost:5173`).

The API base URL defaults to `http://localhost:8080/api`. To use another backend, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

The backend CORS configuration allows the Vite development origin `http://localhost:5173`.

## Screens

- Discover: published event search, category filter, pagination, event details, student registration, and event management actions.
- Clubs: approved clubs, club creation for students, and editing for admins or assigned club managers. Approving a submitted club assigns its creator as manager of that club.
- Student space: registrations, cancellation, and club submissions.
- Manager space: event creation for approved clubs assigned to that manager.
- Admin space: activity metrics, club approval/rejection/deactivation, club editing, and event creation.

Authentication uses the API's JWT bearer token and stores the current session in `sessionStorage`.
