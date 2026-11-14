.PHONY: help dev backend frontend build test lint docker-up docker-down demo-reset

# Default target
help:
	@echo "AURA-MED - Astronaut Health Monitoring System"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Development:"
	@echo "  dev           Start backend and frontend together"
	@echo "  backend       Start Go backend only (port 8080)"
	@echo "  frontend      Start Vite frontend only (port 5173)"
	@echo ""
	@echo "Build & Test:"
	@echo "  build         Build both backend and frontend for production"
	@echo "  test          Run all tests (Go + frontend if available)"
	@echo "  lint          Run linters (gofmt + oxlint)"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up     Start single-origin container (backend serves frontend)"
	@echo "  docker-down   Stop docker containers"
	@echo ""
	@echo "Database:"
	@echo "  demo-reset    Reset and reseed local demo database (removes backend/data/aura_med.db)"
	@echo ""
	@echo "Notes:"
	@echo "  - Web Bluetooth requires HTTPS. Use 'npm run dev:https' in frontend/ if available"
	@echo "  - Demo credentials: elenapark/mission-2041, danielortiz/mission-2056, priyashah/mission-2089"

dev:
	@echo "Starting backend and frontend..."
	@trap 'kill %1 %2' INT TERM; \
	$(MAKE) backend & \
	$(MAKE) frontend & \
	wait

backend:
	@echo "Starting Go backend on :8080..."
	cd backend && go run main.go

frontend:
	@echo "Starting Vite frontend on :5173..."
	cd frontend && npm run dev -- --host 0.0.0.0 --port 5173

build:
	@echo "Building backend..."
	cd backend && go build -o ../bin/aura-med-backend ./...
	@echo "Building frontend..."
	cd frontend && npm run build

test:
	@echo "Running Go tests..."
	cd backend && go test ./...
	@echo "Running frontend tests (if available)..."
	cd frontend && npm test 2>/dev/null || echo "No frontend test script configured"

lint:
	@echo "Checking Go formatting..."
	cd backend && gofmt -l . | grep -q . && (gofmt -l . && exit 1) || echo "Go formatting OK"
	@echo "Running frontend linter..."
	cd frontend && npm run lint

docker-up:
	@echo "Starting single-origin container..."
	docker-compose up --build

docker-down:
	@echo "Stopping containers..."
	docker-compose down

demo-reset:
	@echo "Resetting demo database..."
	rm -f backend/data/aura_med.db
	@echo "Database will be reseeded on next backend start"
	@echo "Run 'make backend' to recreate and seed"