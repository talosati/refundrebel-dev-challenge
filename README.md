# RefundRebel Dev Challenge

This is a full-stack application with a frontend built using Angular and a backend built with Node.js/Express, running in Docker containers.

## Technologies Used

### Frontend
- Angular 20
- TypeScript
- RxJS
- Angular CLI
- Angular Material (Material Design)

### Backend
- Node.js 20 (with Alpine Linux)
- Express.js
- MongoDB (with Mongoose ODM)
- CORS for cross-origin requests
- Morgan for HTTP request logging
- dotenv for environment variables

### DB-Vendo Custom Client

The `db-vendo-custom` directory contains a custom JavaScript client for interacting with Deutsche Bahn's public transport APIs. This client is running in a separate Docker container and our backend service communicates with it through axios to fetch journey information and other public transport data.

### Development Tools
- Docker & Docker Compose
- Nodemon for backend development
- Prettier for code formatting

## Prerequisites

- Docker (v20.10.0 or higher)
- Docker Compose (v2.0.0 or higher)

## Getting Started

### Running the Application

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd refundrebel-dev-challenge
   ```

2. Start the application using Docker Compose:
   ```bash
   docker compose up --build
   ```
   This will build and start all the services (frontend, backend, MongoDB, and DB-Vendo Client).

3. Access the application:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000

### Development Workflow

- The application is configured with hot-reloading for both frontend and backend during development.
- Frontend code changes will automatically reflect in the browser.
- Backend changes will trigger a restart of the Node.js server.

### Stopping the Application

To stop all running containers:
```bash
docker compose down
```

To stop and remove all containers, networks, and volumes:
```bash
docker compose down -v
```

To clean up Docker cache and free up disk space (removes unused containers, networks, images, and build cache):
```bash
docker system prune -a --volumes
```
⚠️ **Warning**: This will remove all unused Docker resources.

## Project Structure

```
.
├── backend/           # Node.js/Express backend
├── frontend/          # Angular frontend
├── db-vendo-custom/   # Custom JavaScript client for Deutsche Bahn APIs
├── docker-compose.yml # Docker Compose configuration
└── README.md          # This file
```
