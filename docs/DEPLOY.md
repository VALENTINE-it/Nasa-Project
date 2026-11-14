# Deployment Guide

## Single-Origin Docker Container

The Dockerfile builds a single container that serves both the Go backend API and the React frontend SPA.

### Quick Start

```bash
# Build the image
docker build -t aura-med .

# Run with persistent SQLite volume
docker run -d \
  -p 8080:8080 \
  -v aura-med-data:/data \
  --name aura-med \
  aura-med

# Verify health
curl http://localhost:8080/api/health
# {"status":"ok","time":"..."}

# Access frontend
open http://localhost:8080
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | `8080` | HTTP port |
| `DB_PATH` | `/data/aura_med.db` | SQLite database path |
| `SESSION_COOKIE_NAME` | `aura_session` | Session cookie name |
| `MAX_REQUESTS_PER_MIN` | `60` | Rate limit |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:8080` | CORS allow-list |
| `SINGLE_ORIGIN` | `true` | Enable embedded frontend |
| `DEMO_PASSWORD_A2041` | `mission-2041` | Demo password (hackathon only) |
| `DEMO_PASSWORD_A2056` | `mission-2056` | Demo password (hackathon only) |
| `DEMO_PASSWORD_A2089` | `mission-2089` | Demo password (hackathon only) |

### Fly.io Deployment

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Create app
fly apps create aura-med

# Create persistent volume for SQLite
fly volumes create aura_med_data --size 1 --region <your-region>

# Deploy
fly deploy

# Scale (optional)
fly scale count 1
```

**fly.toml example:**
```toml
app = "aura-med"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  BACKEND_PORT = "8080"
  DB_PATH = "/data/aura_med.db"
  SINGLE_ORIGIN = "true"
  CORS_ALLOWED_ORIGINS = "https://aura-med.fly.dev"

[mounts]
  source = "aura_med_data"
  destination = "/data"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

  [[http_service.checks]]
    interval = "30s"
    timeout = "5s"
    grace_period = "10s"
    method = "GET"
    path = "/api/health"
```

### Health Check

The container includes a HEALTHCHECK on `/api/health` (interval: 30s, timeout: 5s).

### Notes

- **Web Bluetooth requires HTTPS** - Fly.io provides automatic TLS
- **Single-origin mode** eliminates CORS/cookie issues for Web Bluetooth
- **SQLite on volume** - data persists across restarts
- **Non-root user** - runs as `appuser` (UID 1000)