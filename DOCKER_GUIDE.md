# Docker Setup for Phrendly

This guide explains how to build and run the Phrendly application using Docker.

## Prerequisites

- Docker installed on your system ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)

```bash
# Clone/navigate to the project directory
cd /Users/calebmtuweta/Desktop/Phrendly

# Create .env file from the example
cp .env.example .env

# Edit .env with your actual configuration
nano .env

# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f app
```

The application will be available at `http://localhost:3000`

### 2. Build and Run with Docker CLI

```bash
# Build the Docker image
docker build -t phrendly:latest .

# Run the container
docker run -d \
  --name phrendly-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your_secret_key \
  -v $(pwd)/database:/app/database \
  phrendly:latest

# View logs
docker logs -f phrendly-app
```

## Environment Configuration

Copy `.env.example` to `.env` and configure the following variables:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
# Add any other environment variables your app needs
```

## Common Commands

### Using Docker Compose

```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs -f app

# Rebuild the image
docker-compose build --no-cache

# Restart the service
docker-compose restart app
```

### Using Docker CLI

```bash
# Stop the container
docker stop phrendly-app

# Start the container
docker start phrendly-app

# Remove the container
docker rm phrendly-app

# View logs
docker logs -f phrendly-app

# Access the container shell
docker exec -it phrendly-app sh
```

## Database Persistence

The SQLite database is stored in a volume (`./database`), which means your data will persist even if the container is stopped or removed.

## Port Configuration

- **Default Port**: 3000
- To use a different port, modify the `docker-compose.yml` or use the `-p` flag with Docker CLI:
  ```bash
  docker run -p 8080:3000 phrendly:latest
  ```

## Production Deployment

For production, consider:

1. Using a proper `.env` file with secure values
2. Setting `NODE_ENV=production`
3. Using a process manager like PM2
4. Setting up proper logging and monitoring
5. Using a reverse proxy (nginx)
6. Enabling health checks in docker-compose.yml

Example with health check in `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Troubleshooting

### Port already in use
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Container won't start
```bash
# View detailed logs
docker logs phrendly-app

# Check if image was built correctly
docker images
```

### Database issues
```bash
# Access the container shell
docker exec -it phrendly-app sh

# Check database directory
ls -la /app/database
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
