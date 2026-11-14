# Done

This document records the completed work for the AURA-MED astronaut health monitoring system built with React + Vite on the frontend and Go on the backend.

## Completed work

### Project review and requirements mapping
- Reviewed the project documentation and confirmed the mission objective: create a secure astronaut health monitoring platform with individualized dashboards and shared login access.
- Kept the existing architecture intact and integrated the new functionality into the current app instead of redesigning the project.
- Identified the required system scope: three astronauts, one shared login page, per-astronaut dashboard protection, and backend-enforced data isolation.

### Frontend implementation
- Built the React + Vite frontend in the `frontend/` folder.
- Created a centralized login page at `/`.
- Added React Router navigation for:
  - `/astronaut/dashboard/1`
  - `/astronaut/dashboard/2`
  - `/astronaut/dashboard/3`
- Implemented a protected dashboard flow that prevents unauthorized users from accessing a different astronaut's dashboard.
- Added professional NASA-style dashboard UI with a dark space theme, status pills, metric cards, chart visuals, and responsive layout styling.
- Added profile avatars and prominent astronaut names at the top of each dashboard.
- Included demo credential display on the shared login screen for easy testing.

### Backend implementation
- Built the Go backend in the `backend/` folder.
- Created an SQLite database schema for:
  - astronauts
  - users / credentials
  - health_records
  - health_alerts
- Seeded three astronaut profiles with mission metadata and demo health records.
- Implemented secure password hashing with bcrypt.
- Created a session-based authentication flow using HTTP-only cookies.
- Added server-side checks so an astronaut can only view their own dashboard data.
- Added health-record creation endpoints and validation for incoming readings.
- Added rate limiting to restrict excessive requests.
- Added route-level authorization logic for dashboard access and health record actions.

### Astronaut dashboard features
- Created three astronaut profiles:
  - Elena Park — A-2041
  - Daniel Ortiz — A-2056
  - Priya Shah — A-2089
- Included per-astronaut personal profile data, mission information, and current monitoring status.
- Displayed health metrics for:
  - heart rate
  - blood pressure
  - blood oxygen
  - body temperature
  - respiratory rate
  - sleep duration
  - physical activity
- Added visual trend charts for health monitoring history.
- Added alert cards showing normal, warning, and critical conditions.
- Stored and displayed historical health alerts and recent monitoring records.

### Security and data isolation
- Centralized the authentication flow into one login system.
- Ensured each astronaut account is mapped to a single profile.
- Redirected authenticated users to their own dashboard automatically.
- Enforced backend access checks to reject unauthorized dashboard access even when a user changes the URL.
- Restricted sensitive data to the authenticated user’s account.
- Used demo values only and labelled them clearly as non-live monitoring data.

### Validation completed
- Built the frontend successfully with Vite using `npm run build`.
- Built the Go backend successfully using `go build ./...`.
- Confirmed the backend accepts the shared login flow.
- Confirmed each astronaut can log in with their assigned credentials.
- Confirmed dashboard access is isolated by astronaut account.
- Confirmed unauthorized access is rejected with an authentication or forbidden response.

### Demo login credentials
- Elena Park — username: `elenapark` | password: `mission-2041`
- Daniel Ortiz — username: `danielortiz` | password: `mission-2056`
- Priya Shah — username: `priyashah` | password: `mission-2089`

## Current status
This project is now functional as a demo-ready multi-astronaut health monitoring platform with:
- one shared login page,
- three protected astronaut dashboards,
- backend authorization enforcement,
- SQLite-backed persistent demo data,
- alert and trend tracking,
- responsive NASA-inspired UI.

## Notes
- The current implementation uses clearly labelled demo medical data instead of live device telemetry.
- Session handling is demo-safe and appropriate for the current project scope.
- The app remains ready for any future real monitoring integration or production-hardening work.
