# Build stage
FROM golang:alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev sqlite-dev

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Tidy modules (in case go.mod needs updates for newer Go version)
RUN go mod tidy

# Build the binary
RUN CGO_ENABLED=1 GOOS=linux go build -o aura-med-backend .

# Runtime stage
FROM alpine:3.20

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache sqlite-libs ca-certificates

# Copy binary from builder
COPY --from=builder /app/aura-med-backend .

# Copy data directory for SQLite
COPY --from=builder /app/data ./data

# Create non-root user
RUN adduser -D -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8080

CMD ["./aura-med-backend"]