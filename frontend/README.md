# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.4 and uses [Angular Material](https://material.angular.io/) for implementing Material Design components and theming.

## Development with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed on your system

### Starting the Application

1. Navigate to the project root directory
2. Start the application using Docker Compose:
   ```bash
   docker compose up frontend
   ```
3. Once the container is running, open your browser and navigate to `http://localhost:4200/`
4. The application will automatically reload when you modify source files (hot-reload enabled)

### Stopping the Application

To stop the application, press `Ctrl+C` in the terminal or run:
```bash
docker compose down frontend
```

## Local Development (Without Docker)

If you prefer to run the application directly on your host machine:

### Prerequisites
- Node.js (v16 or later)
- npm (v8 or later)

### Starting the Development Server

```bash
# Install dependencies
npm install

# Start the development server
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code Scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
# Inside the frontend directory or using Docker:
docker compose exec frontend ng generate component component-name

# Or if running locally:
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
docker compose exec frontend ng generate --help
# or
ng generate --help
```

## Building

To build the project for production:

```bash
# Using Docker
docker compose exec frontend ng build

# Or locally
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. The production build optimizes your application for performance and speed.

## Running unit tests

This project uses [Jasmine](https://jasmine.github.io/) as the testing framework with [Karma](https://karma-runner.github.io) as the test runner.

To execute unit tests, you can use either of these commands:

```bash
ng test
# or
npm test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
