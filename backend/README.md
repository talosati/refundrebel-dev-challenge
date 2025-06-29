# Backend Service

This backend service runs as a Docker container and communicates with HAFAS API using Axios.

## Logs

To view the backend logs, run the following command from the project root:

```bash
docker compose logs -f backend
```

## Testing

The application is configured with Jest and Supertest for testing.
To run tests, use the following command:
```bash
npm run test
```