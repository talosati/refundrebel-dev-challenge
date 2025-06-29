# refundrebel Dev Challenge

This is a full-stack application with a frontend built using Angular and a backend built with Node.js/Express, running in Docker containers.

## Technologies Used

### Frontend
- Angular 20
- TypeScript
- RxJS
- Angular CLI
- Angular Material (Material Design)
- Karma (test runner)
- Jasmine (testing framework)

### Backend
- Node.js 20 (with Alpine Linux)
- Express.js
- MongoDB (with Mongoose ODM)
- CORS for cross-origin requests
- Morgan for HTTP request logging
- dotenv for environment variables
- db-vendo-client for Deutsche Bahn public transport APIs
- hafas-client for Deutsche Bahn public transport APIs
- hafas-rest-api for Deutsche Bahn public transport APIs
- axios for HTTP requests
- jest for testing
- supertest for testing
- node-mocks-http for testing

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
   This will build and start all the services (frontend, backend, MongoDB).

3. Access the application:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000
   - HAFAS API: http://localhost:3001
   - **API Documentation (Swagger UI)**: http://localhost:3000/api-docs

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
├── docker-compose.yml # Docker Compose configuration
└── README.md          # This file
```

## API Documentation

The application includes interactive API documentation powered by Swagger UI. You can access it at:

```
http://localhost:3000/api-docs
```

The Swagger documentation provides:
- Interactive API explorer
- Detailed endpoint descriptions
- Request/response schemas
- The ability to test API endpoints directly from the browser

To update the API documentation, modify the JSDoc comments in the route files or update the `swaggerOptions` in `backend/src/index.js`. The documentation will be automatically regenerated when you restart the backend server.