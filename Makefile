# Makefile for Vanitya Project
# Provides convenient commands for Docker and Kubernetes operations

.PHONY: help up down restart logs ps build clean shell-backend shell-ml db-shell redis-cli k8s-apply k8s-delete k8s-status

# Default target - show help
help:
	@echo "Available commands:"
	@echo "  make up          - Start all services with docker-compose"
	@echo "  make up-dev      - Start all services including adminer (dev profile)"
	@echo "  make down        - Stop and remove all containers"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View logs from all services"
	@echo "  make logs-f      - Follow logs from all services"
	@echo "  make ps          - List running containers"
	@echo "  make build       - Build all Docker images"
	@echo "  make clean       - Remove containers, volumes, and images"
	@echo ""
	@echo "Service-specific commands:"
	@echo "  make shell-backend - Open shell in backend container"
	@echo "  make shell-ml      - Open shell in ML service container"
	@echo "  make db-shell      - Open PostgreSQL shell"
	@echo "  make redis-cli     - Open Redis CLI"
	@echo ""
	@echo "Kubernetes commands:"
	@echo "  make k8s-apply   - Apply all k8s manifests"
	@echo "  make k8s-delete  - Delete all k8s resources"
	@echo "  make k8s-status  - Show k8s deployment status"

# Docker Compose Commands
up:
	docker compose up -d

up-dev:
	docker compose --profile dev up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs

logs-f:
	docker compose logs -f

ps:
	docker compose ps

build:
	docker compose build --no-cache

clean:
	docker compose down -v
	docker system prune -f

# Service-specific shell access
shell-backend:
	docker compose exec backend sh

shell-ml:
	docker compose exec ml-service bash

db-shell:
	docker compose exec db psql -U postgres -d vanitya

redis-cli:
	docker compose exec redis redis-cli

# Database management
db-migrate:
	docker compose exec backend npm run migrate

db-seed:
	docker compose exec backend npm run seed

db-reset:
	docker compose exec backend npm run db:reset

# Kubernetes Commands (for local testing)
k8s-apply:
	kubectl apply -f k8s/

k8s-delete:
	kubectl delete namespace vanitya

k8s-status:
	kubectl get all -n vanitya

k8s-logs-backend:
	kubectl logs -n vanitya -l app=backend -f

k8s-logs-ml:
	kubectl logs -n vanitya -l app=ml-service -f

# Development helpers
dev-setup:
	@echo "Setting up development environment..."
	@cp config/env.sample .env 2>/dev/null || true
	@echo "Please edit .env file with your actual values"
	@echo "Run 'make build' to build Docker images"
	@echo "Run 'make up-dev' to start all services"

# Testing
test-backend:
	docker compose exec backend npm test

test-ml:
	docker compose exec ml-service pytest

# Port forwarding for k8s databases
k8s-forward-db:
	kubectl port-forward -n vanitya service/postgres-service 5432:5432

k8s-forward-redis:
	kubectl port-forward -n vanitya service/redis-service 6379:6379