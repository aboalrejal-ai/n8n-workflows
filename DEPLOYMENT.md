# n8n Workflows Platform: Production & Self-Hosted Deployment Guide

This operations guide provides professional instructions for installing, configuring, deploying, and maintaining the **n8n Workflows Search Platform** across multiple environments. Whether you are running a lightweight container on a local machine, setting up a secure production environment with Traefik and Gunicorn, or deploying to a highly scalable Kubernetes cluster, this document outlines every step with production-ready best practices.

---

## ⚡ Quick-Start (Docker Compose)

The easiest way to get the searchable workflow catalog up and running is via Docker Compose. We provide pre-configured composition layers for both development (hot-reload enabled) and production (hardened with resource constraints).

### Development Environment Setup
To build the image locally and start the server with live reloading, run:
```bash
# Clone the repository
git clone https://github.com/aboalrejal-ai/n8n-workflows.git
cd n8n-workflows

# Launch development environment (enables automatic server reload)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Production Deployment Setup
For standard production deployments, use the optimized configurations and run the containers in detached daemon mode:
```bash
# Launch a hardened production environment
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Optional: Spin up the stack with full monitoring profiles (Prometheus/Grafana)
docker compose --profile monitoring up -d
```

---

## 🚀 Granular Deployment Options

We support several infrastructure stacks to suit your team's deployment architecture:

### 1. Docker Compose (Recommended Setup)

Our Docker Compose structure is modular, allowing you to combine configuration files using the `-f` flag to activate profiles as needed.

#### Local Development Mode
Includes local volumes mapping, verbose debugging logs, and automatic file monitoring to reload FastAPI:
```bash
# Start development server
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Spin up development tools profile (e.g., SQLite DB manager, file watchers)
docker compose --profile dev-tools up
```

#### Production-Hardened Mode
Restricts process privileges, implements health-checks, binds correct ports, and configures database isolation:
```bash
# Run basic production instance in the background
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Deploy production with a secure reverse proxy and SSL configuration
docker compose --profile production up -d

# Enable the monitoring stack to collect service metrics
docker compose --profile monitoring up -d
```

---

### 2. Standalone Docker Container

If you prefer to manage the lifecycle of a single container directly via the Docker CLI, build and run the image with these commands:

```bash
# Compile the Docker image locally
docker build -t workflows-doc:latest .

# Launch the container with isolated database volume and logging
docker run -d \
  --name n8n-workflows-docs \
  -p 8000:8000 \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/logs:/app/logs \
  -e ENVIRONMENT=production \
  --restart unless-stopped \
  workflows-doc:latest
```

---

### 3. Native Python Host Deployment

If you are running the application directly on a virtual machine (e.g., Ubuntu, Debian, Windows) without containerization:

#### Prerequisites
*   Python 3.11 or higher
*   Python Package Manager (`pip`)

#### Step-by-Step Installation
```bash
# Install required backend dependencies
pip install -r requirements.txt

# Option A: Run in development mode (hot-reload and interactive debug logs)
python run.py --dev

# Option B: Run in standard host production mode
python run.py --host 0.0.0.0 --port 8000
```

#### Enterprise Production Server (Gunicorn & Uvicorn Workers)
For production workloads, wrap the FastAPI application in a robust WSGI server using Gunicorn with ASGI Uvicorn workers:
```bash
# Ensure Gunicorn and Uvicorn are installed
pip install gunicorn uvicorn

# Start the enterprise server (scales across 4 worker processes)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 api_server:app
```

---

### 4. Kubernetes Cluster Deployment

For cloud-native orchestrations, we provide raw Kubernetes manifests and a custom Helm Chart.

#### Deploying Raw Manifests
Apply the configuration and deployment manifests to your cluster step-by-step:
```bash
# Deploy namespaces, config maps, application logic, and ingress routing
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

#### Deployment via Helm Chart
If you use Helm to manage your application package releases:
```bash
# Install the workflows documentation release from the local Helm directory
helm install n8n-workflows-docs ./helm/workflows-docs
```

---

## ⚙️ Environment Configuration

The application is highly customizable via standard environment variables. You can pass these via Docker files, Kubernetes configurations, or a local `.env` file.

### Complete Environment Variables Reference

| Environment Variable | Description | Default Value | Required |
|:---|:---|:---:|:---:|
| `ENVIRONMENT` | Specifies running environment (`development` or `production`). | `development` | No |
| `LOG_LEVEL` | Verbosity level for system logs (`debug`, `info`, `warning`, `error`). | `info` | No |
| `HOST` | The network interface the host server binds to. | `127.0.0.1` | No |
| `PORT` | The port the FastAPI web server listens on. | `8000` | No |
| `DATABASE_PATH` | Relative or absolute path to the SQLite search database. | `database/workflows.db` | No |
| `WORKFLOWS_PATH` | Location of the workflow JSON templates catalog. | `workflows` | No |
| `ENABLE_METRICS` | Enables Prometheus scrape endpoints (`true` or `false`). | `false` | No |
| `MAX_WORKERS` | Max worker concurrent processes spawned by the server. | `1` | No |
| `DEBUG` | Enables developer mode and detailed error stack traces. | `false` | No |
| `RELOAD` | Activates automatic application restarts when code changes. | `false` | No |

---

### Configuration File Patterns

Create environment-specific files in your root workspace:

#### Local Development Settings (`.env`)
```ini
ENVIRONMENT=development
LOG_LEVEL=debug
DEBUG=true
RELOAD=true
```

#### Production Platform Settings (`.env.production`)
```ini
ENVIRONMENT=production
LOG_LEVEL=warning
ENABLE_METRICS=true
MAX_WORKERS=4
```

---

## 🛡️ Production Security Hardening

To run this platform securely in a production environment, implement these reverse proxy and SSL layers:

### 1. Reverse Proxy Middleware (Traefik Example)
Filter and protect incoming traffic using Traefik dynamic middleware rules:

```yaml
# traefik/config/dynamic.yml
http:
  middlewares:
    auth:
      basicAuth:
        users:
          - "admin:$2y$10$tZ2R4..."  # Generate secure passwords using htpasswd tool
    security-headers:
      headers:
        customRequestHeaders:
          X-Forwarded-Proto: "https"
        customResponseHeaders:
          X-Frame-Options: "DENY"
          X-Content-Type-Options: "nosniff"
          X-XSS-Protection: "1; mode=block"
          Content-Security-Policy: "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
        sslRedirect: true
```

### 2. Automated SSL/TLS Configuration
Configure Let's Encrypt directly in your Docker Compose or proxy layer to ensure secure, HTTPS-only traffic:

```yaml
# Inside docker-compose.prod.yml under Traefik command settings
command:
  - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
  - "--certificatesresolvers.myresolver.acme.email=secops@yourdomain.com"
```

#### Using Custom SSL/TLS Certificates
If you are deploying on-premise with pre-purchased or corporate certificates:
```yaml
volumes:
  - ./ssl/certs:/ssl:ro
```

### 3. Restricting Admin Endpoints via Basic Auth
Secure sensitive backend endpoints (like `/api/reindex`) using htpasswd:

```bash
# Generate htpasswd hash
htpasswd -nb admin yoursecurepassword

# Map generated password inside Traefik container labels
- "traefik.http.middlewares.auth.basicauth.users=admin:$$2y$$10$$..."
```

---

## ⚡ Performance Tuning

Optimize server operations to maximize throughput and achieve sub-100ms response times:

### 1. Enforcing System Resource Limits
Bound the system footprint to prevent OOM errors in shared or low-cost virtual private servers:

```yaml
# Inside docker-compose.prod.yml deployment block
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.50'
    reservations:
      memory: 256M
      cpus: '0.25'
```

### 2. Search Database Indexes & Optimization
Rebuild full-text search index structures to keep search performance optimal after importing new workflows:

```bash
# Force a database reindex via CLI
python run.py --reindex

# Alternatively, trigger reindexing via the authenticated admin REST API
curl -X POST http://localhost:8000/api/reindex?admin_token=YOUR_SECURE_ADMIN_TOKEN
```

### 3. Client Caching Headers (Static Assets Optimization)
Accelerate UI load speeds by caching static scripts, styles, and workflow assets on client browsers:

```yaml
# Traefik headers configuration
http:
  middlewares:
    cache-headers:
      headers:
        customResponseHeaders:
          Cache-Control: "public, max-age=31536000, immutable"
```

---

## 📈 Monitoring & Logging Services

Ensure high availability by hooking up metrics collectors and system logs.

### 1. Container & API Health Checking
Establish standard health checks inside your Docker and Kubernetes orchestrations:

```bash
# Docker health check validation command
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/stats || exit 1

# Manual health validation via curl
curl http://localhost:8000/api/stats
```

### 2. Log Inspections & Troubleshooting
Analyze logs to audit incoming API requests and verify error-free execution:

```bash
# Stream live logs from Docker Compose services
docker compose logs -f workflows-docs

# Audit log file location mapped inside container
tail -f /app/logs/app.log
```

### 3. Monitoring with Prometheus & Grafana
Collect execution speeds and request volumes:
```bash
# Spin up Prometheus monitoring service profile
docker compose --profile monitoring up -d

# Open the local Prometheus metrics interface
# Access: http://localhost:9090
```

---

## 💾 Backup & Disaster Recovery

Set up structured copy operations to protect your search index and workflow catalogs.

### 1. Database Hot-Backup (SQLite)
Safely copy the SQLite database without interrupting active read streams:
```bash
# Standard backup creation command
cp database/workflows.db database/workflows.db.backup

# Containerized hot-backup execution
docker exec n8n-workflows-docs cp /app/database/workflows.db /app/database/workflows.db.backup
```

### 2. Creating Complete Configuration Backups
Archive database volumes, environment configurations, and static parameters into a secure tarball:
```bash
tar -czf n8n-workflows-backup-$(date +%Y%m%d).tar.gz \
  database/ \
  logs/ \
  docker-compose*.yml \
  .env*
```

### 3. Disaster Recovery Sequence
Restore service operations swiftly in the event of an infrastructure crash:
```bash
# Shut down active container operations
docker compose down

# Overwrite corrupted database files with verified backups
cp database/workflows.db.backup database/workflows.db

# Relaunch the containerized application
docker compose up -d
```

---

## ⚖️ Scaling & Zero-Downtime Updates

Manage traffic spikes and apply software updates with zero user disruption.

### 1. Horizontal Instance Scaling
Scale the application server across multiple containers:
```bash
# Scale the fastapi backend instances dynamically to 3 containers
docker compose up --scale workflows-docs=3 -d
```

### 2. Load Balancer Sticky Sessions
Ensure smooth user navigation by configuring Traefik session stickiness:
```yaml
labels:
  - "traefik.http.services.workflows-docs.loadbalancer.server.port=8000"
  - "traefik.http.services.workflows-docs.loadbalancer.sticky=true"
  - "traefik.http.services.workflows-docs.loadbalancer.sticky.cookie.name=n8n_workflows_cookie"
```

### 3. Blue-Green Zero-Downtime Deployment
Deploy code updates without dropping a single request:
```bash
# 1. Build and run the fresh application container in green environment namespace
docker compose -p n8n-workflows-green up -d --build

# 2. Perform automated tests on green cluster to verify health status
# 3. Seamlessly point your load balancer / proxy configuration to the green target
# 4. Gracefully terminate and tear down the legacy blue environment namespace
docker compose -p n8n-workflows-blue down
```

---

## 🛠️ Common Operations Troubleshooting

Solve runtime issues quickly with these verified procedures:

### 1. SQLite Database Lock Errors (`database is locked`)
*   **Root Cause**: Multiple write tasks attempting to access SQLite concurrently.
*   **Resolution**: Verify and fix write permissions on the directory:
    ```bash
    # Inspect directory ownership
    ls -la database/
    
    # Apply read-write permissions to container user
    chmod 664 database/workflows.db
    ```

### 2. Bounding Network Port Conflicts (`port already in use`)
*   **Root Cause**: Local processes or other Docker instances binding to port 8000.
*   **Resolution**: Identify and stop conflicting processes:
    ```bash
    # Inspect processes binding to port 8000
    lsof -i :8000
    
    # Or start our container using an alternative host port mapping
    docker compose up -d -p 8080:8000
    ```

### 3. Container Out-Of-Memory (OOM) Termination
*   **Root Cause**: Memory limit constraints breached under concurrent search scans.
*   **Resolution**: Monitor stats and expand limits in your production config:
    ```bash
    # View live container resource usage stats
    docker stats
    
    # Edit docker-compose.prod.yml deploy limits to allow higher memory (e.g. 512MB to 1GB)
    ```

---

## 📋 Security Operations Checklist
Ensure these security practices are fully met before making your platform public:
*   [ ] Generate and set a highly complex `ADMIN_TOKEN` value.
*   [ ] Harden CORS settings by permitting only your production domain names.
*   [ ] Force automatic SSL redirects to secure HTTPS connections.
*   [ ] Configure basic auth parameters or firewall blocks on administrative URLs.
*   [ ] Enforce container process boundaries to run under a non-root user.
*   [ ] Implement regular crontab backups for both database and log assets.
*   [ ] Schedule weekly scans for security advisories and update package dependencies.