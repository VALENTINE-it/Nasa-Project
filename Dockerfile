# Build stage for frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build stage for backend
FROM golang:1.23-alpine AS backend-builder
# Note: go.mod specifies 1.27.4; golang:1.23 supports go 1.23+ via GOTOOLCHAIN
ENV GOTOOLCHAIN=auto
WORKDIR /app
RUN apk add --no-cache gcc musl-dev sqlite-dev
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ./dist
RUN CGO_ENABLED=1 go build -o aura-med-backend -ldflags="-s -w" .

# Final stage
FROM alpine:3.20
WORKDIR /app
RUN apk add --no-cache ca-certificates sqlite-libs wget && \
    adduser -D -u 1000 appuser && \
    mkdir -p /data /app/data && chown appuser:appuser /data /app/data

COPY --from=backend-builder /app/aura-med-backend .
COPY --from=backend-builder /app/dist ./dist

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:8080/api/health || exit 1

ENV BACKEND_PORT=8080 \
    DB_PATH=/data/aura_med.db \
    SESSION_COOKIE_NAME=aura_session \
    MAX_REQUESTS_PER_MIN=60 \
    CORS_ALLOWED_ORIGINS=http://localhost:8080 \
    SINGLE_ORIGIN=true

VOLUME ["/data"]

ENTRYPOINT ["./aura-med-backend"]