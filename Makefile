.PHONY: install build clean test lint watch publish help \
        build-all test-all publish-skills publish-gen publish-all \
        gen-build gen-scaffold gen-publish-dry gen-pack-dry

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

# ── Workspace ─────────────────────────────────────────────────────────────────

build-all: ## Build every workspace package
	pnpm -r run build

test-all: ## Test every workspace package
	pnpm -r run test

publish-skills: ## Publish @14e-inc/comfy-skills to GitHub Packages
	$(MAKE) -C packages/comfy-skills publish

publish-gen: ## Publish @14e-inc/generator-comfy-skill to GitHub Packages
	$(MAKE) -C packages/generator-comfy-skill publish

publish-all: build-all ## Build all, then publish in dependency order (skills → generator)
	$(MAKE) publish-skills
	$(MAKE) publish-gen

# ── Generator dev ─────────────────────────────────────────────────────────────

gen-build: ## Build the Yeoman generator
	$(MAKE) -C packages/generator-comfy-skill build

gen-scaffold: ## Scaffold a test skills module (output path printed on exit)
	$(MAKE) -C packages/generator-comfy-skill scaffold

gen-publish-dry: ## Dry-run publish the generator
	$(MAKE) -C packages/generator-comfy-skill publish-dry

gen-pack-dry: ## Show generator tarball manifest (pack --dry-run)
	$(MAKE) -C packages/generator-comfy-skill pack-dry

# ── Help ──────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
