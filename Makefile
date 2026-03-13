.PHONY: dev build seed docker-build docker-up docker-down

# Local development
dev:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

seed:
	cd frontend && PB_URL=http://localhost:8090 PB_ADMIN_EMAIL=admin@ironlog.local PB_ADMIN_PASSWORD=adminpassword123 npx tsx src/lib/migrate.ts

# Docker
docker-build:
	docker build -t ironlog .

docker-up:
	docker compose up -d

docker-down:
	docker compose down
