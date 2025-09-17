# Kubernetes Manifests for Vanitya

⚠️ **DEV/TEST USE ONLY - NOT FOR PRODUCTION** ⚠️

These Kubernetes manifests are designed for local development and testing purposes only.

## Prerequisites

- Docker Desktop with Kubernetes enabled
- kubectl CLI installed
- Local Docker images built (see main README)

## Quick Start

1. **Build Docker images locally first:**
   ```bash
   # From project root
   docker build -t vanitya-backend:latest .
   docker build -t vanitya-ml:latest ./vanitya-ml
   ```

2. **Apply all manifests:**
   ```bash
   kubectl apply -f k8s/
   ```

3. **Check deployment status:**
   ```bash
   kubectl get all -n vanitya
   ```

4. **Access services:**
   - Backend API: http://localhost:30500
   - ML Service: http://localhost:30800
   - PostgreSQL: localhost:5432 (port-forward required)
   - Redis: localhost:6379 (port-forward required)

## Port Forwarding for Databases

```bash
# PostgreSQL
kubectl port-forward -n vanitya service/postgres-service 5432:5432

# Redis
kubectl port-forward -n vanitya service/redis-service 6379:6379
```

## Important Notes

1. **Secrets:** The provided secrets are base64 encoded defaults. Replace them with your actual values:
   ```bash
   echo -n "your-actual-value" | base64
   ```

2. **Storage:** Uses emptyDir volumes - data is lost when pods restart

3. **Images:** Set to `imagePullPolicy: Never` for local development

## Cleanup

Remove all resources:
```bash
kubectl delete namespace vanitya
```

## Troubleshooting

View logs:
```bash
kubectl logs -n vanitya deployment/backend
kubectl logs -n vanitya deployment/ml-service
```

Describe pod for issues:
```bash
kubectl describe pod -n vanitya <pod-name>
```

## Files Overview

- `00-namespace.yaml` - Creates the vanitya namespace
- `01-configmap.yaml` - Application configuration
- `02-secret.yaml` - Sensitive data (passwords, API keys)
- `03-database-deployment.yaml` - PostgreSQL and Redis
- `04-app-deployment.yaml` - Backend and ML services