# Universal Makefile for Claude Code Projects
# Supports Python, Node.js, and Docker workflows

.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Environment setup
.PHONY: install
install: ## Install all dependencies
	@if [ -f "pyproject.toml" ]; then \
		echo "Installing Python dependencies..."; \
		poetry install --with dev; \
	elif [ -f "requirements.txt" ]; then \
		pip install -r requirements.txt; \
	fi
	@if [ -f "package.json" ]; then \
		echo "Installing Node dependencies..."; \
		if command -v pnpm > /dev/null; then \
			pnpm install; \
		elif command -v yarn > /dev/null; then \
			yarn install; \
		else \
			npm install; \
		fi; \
	fi
	@if [ -f ".pre-commit-config.yaml" ]; then \
		echo "Installing pre-commit hooks..."; \
		pre-commit install; \
	fi

.PHONY: dev
dev: ## Start development environment
	@if [ -f "docker-compose.yml" ]; then \
		docker-compose up -d; \
	fi
	@if [ -f "package.json" ]; then \
		if grep -q '"dev"' package.json; then \
			npm run dev; \
		elif grep -q '"start:dev"' package.json; then \
			npm run start:dev; \
		fi; \
	elif [ -f "pyproject.toml" ]; then \
		if grep -q 'uvicorn' pyproject.toml; then \
			poetry run uvicorn src.main:app --reload; \
		elif grep -q 'flask' pyproject.toml; then \
			poetry run flask run --debug; \
		elif grep -q 'django' pyproject.toml; then \
			poetry run python manage.py runserver; \
		fi; \
	fi

# Testing
.PHONY: test
test: ## Run all tests
	@echo "Running tests..."
	@if [ -f "pyproject.toml" ]; then \
		poetry run pytest -v --cov; \
	elif [ -f "package.json" ]; then \
		if grep -q '"test"' package.json; then \
			npm test; \
		fi; \
	fi

.PHONY: test-unit
test-unit: ## Run unit tests only
	@if [ -f "pyproject.toml" ]; then \
		poetry run pytest tests/unit -v; \
	elif [ -f "package.json" ]; then \
		npm run test:unit; \
	fi

.PHONY: test-integration
test-integration: ## Run integration tests only
	@if [ -f "pyproject.toml" ]; then \
		poetry run pytest tests/integration -v; \
	elif [ -f "package.json" ]; then \
		npm run test:integration; \
	fi

.PHONY: test-e2e
test-e2e: ## Run end-to-end tests
	@if [ -f "pyproject.toml" ]; then \
		poetry run pytest tests/e2e -v; \
	elif [ -f "package.json" ]; then \
		npm run test:e2e; \
	fi

.PHONY: test-coverage
test-coverage: ## Generate test coverage report
	@if [ -f "pyproject.toml" ]; then \
		poetry run pytest --cov --cov-report=html --cov-report=term; \
	elif [ -f "package.json" ]; then \
		npm run test:coverage; \
	fi

# Code quality
.PHONY: lint
lint: ## Run linters
	@echo "Running linters..."
	@if [ -f "pyproject.toml" ]; then \
		poetry run black --check src/ tests/; \
		poetry run isort --check src/ tests/; \
		poetry run flake8 src/ tests/; \
		poetry run mypy src/; \
	fi
	@if [ -f "package.json" ]; then \
		if grep -q '"lint"' package.json; then \
			npm run lint; \
		fi; \
	fi

.PHONY: format
format: ## Format code automatically
	@echo "Formatting code..."
	@if [ -f "pyproject.toml" ]; then \
		poetry run black src/ tests/; \
		poetry run isort src/ tests/; \
	fi
	@if [ -f "package.json" ]; then \
		if grep -q '"format"' package.json; then \
			npm run format; \
		fi; \
	fi

.PHONY: type-check
type-check: ## Run type checking
	@if [ -f "pyproject.toml" ]; then \
		poetry run mypy src/; \
	elif [ -f "tsconfig.json" ]; then \
		npx tsc --noEmit; \
	fi

.PHONY: security
security: ## Run security scans
	@echo "Running security scans..."
	@if [ -f "pyproject.toml" ]; then \
		poetry run bandit -r src/; \
		poetry run safety check; \
	fi
	@if [ -f "package.json" ]; then \
		npm audit; \
	fi

.PHONY: pre-commit
pre-commit: ## Run pre-commit checks
	@pre-commit run --all-files

# Build
.PHONY: build
build: ## Build the project
	@if [ -f "Dockerfile" ]; then \
		docker build -t $(shell basename $(CURDIR)) .; \
	elif [ -f "package.json" ]; then \
		if grep -q '"build"' package.json; then \
			npm run build; \
		fi; \
	elif [ -f "pyproject.toml" ]; then \
		poetry build; \
	fi

.PHONY: clean
clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "build" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type f -name ".coverage" -delete 2>/dev/null || true
	@find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true

# Docker
.PHONY: docker-build
docker-build: ## Build Docker image
	@docker build -t $(shell basename $(CURDIR)):latest .

.PHONY: docker-run
docker-run: ## Run Docker container
	@docker run -it --rm -p 8000:8000 $(shell basename $(CURDIR)):latest

.PHONY: docker-compose-up
docker-compose-up: ## Start all services with Docker Compose
	@docker-compose up -d

.PHONY: docker-compose-down
docker-compose-down: ## Stop all services
	@docker-compose down

.PHONY: docker-compose-logs
docker-compose-logs: ## View Docker Compose logs
	@docker-compose logs -f

.PHONY: docker-clean
docker-clean: ## Clean Docker resources
	@docker-compose down -v
	@docker system prune -f

# Database
.PHONY: db-migrate
db-migrate: ## Run database migrations
	@if [ -f "alembic.ini" ]; then \
		poetry run alembic upgrade head; \
	elif [ -f "manage.py" ]; then \
		python manage.py migrate; \
	elif [ -f "knexfile.js" ]; then \
		npx knex migrate:latest; \
	fi

.PHONY: db-rollback
db-rollback: ## Rollback database migration
	@if [ -f "alembic.ini" ]; then \
		poetry run alembic downgrade -1; \
	elif [ -f "manage.py" ]; then \
		python manage.py migrate --reverse; \
	elif [ -f "knexfile.js" ]; then \
		npx knex migrate:rollback; \
	fi

.PHONY: db-seed
db-seed: ## Seed database with test data
	@if [ -f "seeds.py" ]; then \
		poetry run python seeds.py; \
	elif [ -f "knexfile.js" ]; then \
		npx knex seed:run; \
	fi

.PHONY: db-reset
db-reset: ## Reset database (WARNING: destroys all data)
	@echo "WARNING: This will destroy all data. Press Ctrl+C to cancel, or Enter to continue."
	@read confirm
	@make db-rollback || true
	@make db-migrate
	@make db-seed

# Utilities
.PHONY: shell
shell: ## Start interactive shell
	@if [ -f "pyproject.toml" ]; then \
		poetry shell; \
	elif [ -f "package.json" ]; then \
		npm run shell || node; \
	fi

.PHONY: logs
logs: ## View application logs
	@if [ -f "docker-compose.yml" ]; then \
		docker-compose logs -f; \
	else \
		tail -f logs/*.log 2>/dev/null || echo "No logs found"; \
	fi

.PHONY: env
env: ## Copy .env.example to .env
	@if [ -f ".env.example" ] && [ ! -f ".env" ]; then \
		cp .env.example .env; \
		echo ".env file created from .env.example"; \
	else \
		echo ".env file already exists or .env.example not found"; \
	fi

# CI/CD
.PHONY: ci
ci: install lint type-check test security ## Run all CI checks

.PHONY: deploy-staging
deploy-staging: ## Deploy to staging environment
	@echo "Deploying to staging..."
	@./scripts/deploy.sh staging

.PHONY: deploy-production
deploy-production: ## Deploy to production environment
	@echo "WARNING: Deploying to PRODUCTION. Press Ctrl+C to cancel, or Enter to continue."
	@read confirm
	@./scripts/deploy.sh production

# Git hooks
.PHONY: hooks-install
hooks-install: ## Install git hooks
	@pre-commit install
	@pre-commit install --hook-type commit-msg
	@echo "Git hooks installed"

.PHONY: hooks-run
hooks-run: ## Run git hooks on all files
	@pre-commit run --all-files

# Project specific
.PHONY: init
init: env install hooks-install ## Initialize project for first time
	@echo "Project initialized successfully!"
	@echo "Run 'make dev' to start development"

.PHONY: update
update: ## Update dependencies
	@if [ -f "pyproject.toml" ]; then \
		poetry update; \
	fi
	@if [ -f "package.json" ]; then \
		if command -v pnpm > /dev/null; then \
			pnpm update; \
		elif command -v yarn > /dev/null; then \
			yarn upgrade; \
		else \
			npm update; \
		fi; \
	fi

.PHONY: check
check: lint type-check test security ## Run all checks (lint, type-check, test, security)
	@echo "All checks passed!"