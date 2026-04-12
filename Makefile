.PHONY: install build clean test lint watch publish help

# Default target
.DEFAULT_GOAL := help

install: ## Install dependencies
	pnpm install

build: ## Build all dist outputs (ESM, CJS, UMD)
	pnpm run build

clean: ## Remove dist directory
	rm -rf dist

test: ## Run tests
	pnpm test

test-watch: ## Run tests in watch mode
	pnpm run test:watch

lint: ## Lint source files
	pnpm run lint

watch: ## Build in watch mode
	pnpm run build:watch

publish: build ## Build and publish to GitHub Packages
	@echo "Publishing $(shell node -p "require('./package.json').name")@$(shell node -p "require('./package.json').version")"
	pnpm publish

version-patch: ## Bump patch version (0.0.x)
	pnpm version patch

version-minor: ## Bump minor version (0.x.0)
	pnpm version minor

version-major: ## Bump major version (x.0.0)
	pnpm version major

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
