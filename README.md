# Korp Test Microservices

This project contains two microservices:
1. Billing Service (runs on port 3001)
2. Stock Service (runs on port 3000)

## Prerequisites

- Docker
- Docker Compose

## Running the Services

### Option 1: Using the combined docker-compose (Recommended)

To start both microservices with a single command, run:

```bash
docker-compose up --build
```

This will start:
- Billing service API on port 3001
- Stock service API on port 3000
- PostgreSQL databases for each service

### Option 2: Running services separately

You can also run each service separately:

```bash
# In one terminal, navigate to billing_service_api directory
cd billing_service_api
docker-compose up --build

# In another terminal, navigate to stock_service_api directory
cd stock_service_api
docker-compose up --build
```

### Option 3: Using the batch script (Windows only)

On Windows, you can simply run the batch script:

```cmd
start-services.bat
```

### Option 4: Using the shell script (Linux/Mac)

On Linux or Mac, you can run the shell script:

```bash
./start-services.sh
```

## Troubleshooting Connection Issues

If you're having trouble connecting to the services, it might be due to environment variables not being properly set. Try these solutions:

1. **Use the provided scripts**: The [start-services.bat](file:///c%3A/Users/lucas/Documents/github/Korp%20Teste/start-services.bat) (Windows) or [start-services.sh](file:///c%3A/Users/lucas/Documents/github/Korp%20Teste/start-services.sh) (Linux/Mac) scripts ensure proper environment variable setup.

2. **Check container status**: Run `docker ps` to see which containers are running. If only database containers are running, the application containers are failing to start.

3. **Check container logs**: Run `docker logs <container_name>` to see error messages from failed containers.

4. **Verify environment variables**: Make sure the [.env](file:///c%3A/Users/lucas/Documents/github/Korp%20Teste/.env) file contains the correct values:
   - DB_USER=postgres
   - DB_PASSWORD=LucasBP#258
   - BILLING_DB_NAME=billing_db
   - STOCK_DB_NAME=stock_db

## Development

For development with hot reloading, run:

```bash
docker-compose up --build
```

The services will automatically reload when code changes are detected.

## Stopping the Services

To stop the services, press `Ctrl+C` in the terminal where docker-compose is running, or run:

```bash
docker-compose down
```

To stop and remove all data (including databases), run:

```bash
docker-compose down -v
```

## Accessing the Services

- Stock Service: http://localhost:3000
- Billing Service: http://localhost:3001

## Database Access

- Stock Service Database: localhost:5432
- Billing Service Database: localhost:5433

## Environment Variables

The project uses environment variables for configuration. Make sure to set the following variables:

- DB_USER: Database user (default: postgres)
- DB_PASSWORD: Database password (default: LucasBP%23258)
- DB_SSLMODE: SSL mode for database connection (default: disable)
- BILLING_DB_NAME: Billing service database name (default: billing_db)
- STOCK_DB_NAME: Stock service database name (default: stock_db)

These variables are defined in the .env file at the root of the project.