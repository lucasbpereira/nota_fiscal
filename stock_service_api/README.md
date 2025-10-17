# Nota Fiscal API

## Setup Instructions

1. Copy the environment template and customize it:
   ```bash
   cp configs/.env.example configs/.env
   # Edit configs/.env with your desired values
   ```

2. Build and start the services:
   ```bash
   docker-compose --env-file ./configs/.env down -v 
   docker-compose --env-file ./configs/.env build --no-cache
   docker-compose --env-file ./configs/.env up -d
   ```

3. The migrations are automatically applied when the migrate service starts.

## After Making Code Changes

When you make changes to your Go code, you need to rebuild the Docker images:

```bash
# Stop the services
docker-compose --env-file ./configs/.env down

# Rebuild the images with your changes
docker-compose --env-file ./configs/.env build --no-cache

# Start the services again
docker-compose --env-file ./configs/.env up -d
```

## Useful Commands

- Check application logs: `docker-compose logs app`
- Check database tables: `docker-compose exec db psql -U postgres -d stock_db -c "\dt"`
- Stop services: `docker-compose down`