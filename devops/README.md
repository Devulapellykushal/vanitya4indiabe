# Vanitya DevOps Documentation

## Prerequisites

### Windows with WSL2

1. **Install Docker Desktop for Windows**
   - Download from: https://www.docker.com/products/docker-desktop/
   - During installation, ensure "Use WSL 2 instead of Hyper-V" is selected
   - After installation, go to Settings → General → Use the WSL 2 based engine (should be checked)

2. **Enable WSL2 (if not already enabled)**
   ```powershell
   # Run in PowerShell as Administrator
   wsl --install
   wsl --set-default-version 2
   ```

3. **Optional: Enable Kubernetes in Docker Desktop**
   - Open Docker Desktop
   - Go to Settings → Kubernetes
   - Check "Enable Kubernetes"
   - Click "Apply & Restart"

4. **Install Make for Windows** (optional but recommended)
   - Using Chocolatey: `choco install make`
   - Or download GnuWin32 Make: http://gnuwin32.sourceforge.net/packages/make.htm

### Linux/Mac

1. **Install Docker and Docker Compose**
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install docker.io docker-compose
   
   # Mac
   brew install docker docker-compose
   ```

2. **Install kubectl (for Kubernetes)**
   ```bash
   # Linux
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
   
   # Mac
   brew install kubectl
   ```

## Quick Start Guide

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd Vanitya

# Copy environment template
cp config/env.sample .env

# Edit .env with your actual values
# Important: Set your API keys and secrets
```

### 2. Using Docker Compose

#### Start all services:
```bash
make up
# Or with adminer (database UI)
make up-dev
```

#### Check service status:
```bash
make ps
```

#### View logs:
```bash
make logs
# Follow logs in real-time
make logs-f
```

#### Stop services:
```bash
make down
```

### 3. Accessing Services

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:5000 | Node.js backend service |
| ML Service | http://localhost:8000 | Python ML service |
| PostgreSQL | localhost:5432 | Database (user: postgres, password: postgres) |
| Redis | localhost:6379 | Cache service |
| Adminer | http://localhost:8080 | Database UI (dev profile only) |

### 4. Database Access

#### Using Adminer (Web UI):
1. Start services with dev profile: `make up-dev`
2. Navigate to http://localhost:8080
3. Login with:
   - System: PostgreSQL
   - Server: db
   - Username: postgres
   - Password: postgres
   - Database: vanitya

#### Using CLI:
```bash
# PostgreSQL shell
make db-shell

# Or directly with psql
docker compose exec db psql -U postgres -d vanitya

# Redis CLI
make redis-cli
```

#### Using pgAdmin or other tools:
Connect to `localhost:5432` with:
- Host: localhost
- Port: 5432
- Database: vanitya
- Username: postgres
- Password: postgres

## Development Workflow

### 1. Making Code Changes

Backend code (Node.js):
- Edit files in `/src` directory
- Changes are auto-reloaded via nodemon
- View logs: `docker compose logs -f backend`

ML Service (Python):
- Edit files in `/vanitya-ml/src` directory
- Changes are auto-reloaded via uvicorn
- View logs: `docker compose logs -f ml-service`

### 2. Installing New Dependencies

#### Backend (Node.js):
```bash
# Add to package.json then rebuild
docker compose build backend
docker compose up -d backend
```

#### ML Service (Python):
```bash
# Add to vanitya-ml/requirements.txt then rebuild
docker compose build ml-service
docker compose up -d ml-service
```

### 3. Database Migrations

```bash
# Run migrations
make db-migrate

# Seed database
make db-seed

# Reset database
make db-reset
```

### 4. Testing

```bash
# Test backend
make test-backend

# Test ML service
make test-ml
```

## Using Kubernetes (Optional)

### Setup

1. Enable Kubernetes in Docker Desktop (see Prerequisites)
2. Build Docker images locally:
   ```bash
   docker build -t vanitya-backend:latest .
   docker build -t vanitya-ml:latest ./vanitya-ml
   ```

### Deploy to Kubernetes

```bash
# Apply all manifests
make k8s-apply

# Check status
make k8s-status

# View backend logs
make k8s-logs-backend

# View ML service logs
make k8s-logs-ml
```

### Access Services

- Backend: http://localhost:30500
- ML Service: http://localhost:30800

For database access, use port forwarding:
```bash
# In separate terminals
make k8s-forward-db
make k8s-forward-redis
```

### Cleanup

```bash
make k8s-delete
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port (Windows)
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -i :5000
   kill -9 <PID>
   ```

2. **Docker daemon not running**
   - Windows: Start Docker Desktop
   - Linux: `sudo systemctl start docker`

3. **Permission denied errors**
   - Linux: Add user to docker group
     ```bash
     sudo usermod -aG docker $USER
     newgrp docker
     ```

4. **Container fails to start**
   ```bash
   # Check logs
   docker compose logs <service-name>
   
   # Rebuild image
   docker compose build --no-cache <service-name>
   ```

5. **Database connection issues**
   - Ensure PostgreSQL container is healthy:
     ```bash
     docker compose ps
     ```
   - Check environment variables in .env file

### Debug Commands

```bash
# Shell into container
make shell-backend  # Backend container
make shell-ml       # ML service container

# Inspect container
docker compose exec <service> sh

# Check container environment
docker compose exec backend env

# Test database connection
docker compose exec backend node -e "console.log('Testing DB connection...')"
```

## Security Notes

⚠️ **Important for Production:**

1. Change all default passwords in .env
2. Use proper secrets management (not .env files)
3. Enable HTTPS/TLS
4. Configure proper firewall rules
5. Use production-grade database configurations
6. Implement proper backup strategies
7. Set resource limits in Docker/Kubernetes

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review service logs: `make logs`
3. Check container status: `make ps`
4. Refer to individual service documentation