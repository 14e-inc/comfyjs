.PHONY: install build clean test lint watch publish help

# Default target
.DEFAULT_GOAL := help

install: ## Install dependencies
	npm install

build: ## Build all dist outputs (ESM, CJS, UMD)
	npm run build

clean: ## Remove dist directory
	rm -rf dist

test: ## Run tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

lint: ## Lint source files
	npm run lint

watch: ## Build in watch mode
	npm run build:watch

publish: build ## Build and publish to GitHub Packages
	@echo "Publishing $(shell node -p "require('./package.json').name")@$(shell node -p "require('./package.json').version")"
	npm publish

version-patch: ## Bump patch version (0.0.x)
	npm version patch

version-minor: ## Bump minor version (0.x.0)
	npm version minor

version-major: ## Bump major version (x.0.0)
	npm version major

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
