.PHONY: build watch typecheck clean \
        pack-dry publish-dry publish \
        version-patch version-minor version-major \
        scaffold help

.DEFAULT_GOAL := help

PKG_ID := $(shell node -p "const p=JSON.parse(require('fs').readFileSync('package.json','utf8'));p.name+'@'+p.version" 2>/dev/null)

# ── Build ─────────────────────────────────────────────────────────────────────

build: ## Compile TypeScript → dist/
	pnpm run build

watch: ## Compile in watch mode
	pnpm run build:watch

typecheck: ## Type-check without emitting
	pnpm exec tsc --noEmit

clean: ## Remove dist/
	pnpm run clean

# ── Publish ───────────────────────────────────────────────────────────────────

pack-dry: build ## Show what files would be included in the published tarball
	pnpm pack --dry-run

publish-dry: build ## Dry-run publish — validates auth + shows upload manifest
	@echo "Dry-run: $(PKG_ID)"
	pnpm publish --dry-run --access restricted

publish: build ## Build and publish to GitHub Packages
	@echo "Publishing $(PKG_ID)"
	pnpm publish --access restricted

# ── Versioning ────────────────────────────────────────────────────────────────

version-patch: ## Bump patch version (0.0.x) and commit
	pnpm version patch

version-minor: ## Bump minor version (0.x.0) and commit
	pnpm version minor

version-major: ## Bump major version (x.0.0) and commit
	pnpm version major

# ── Generator dev ─────────────────────────────────────────────────────────────

# Override SCAFFOLD_DEST to control where output lands, e.g.:
#   make scaffold SCAFFOLD_DEST=./test-output
scaffold: build ## Run the generator into SCAFFOLD_DEST (default: temp dir)
	@echo "Running generator…"
	SCAFFOLD_DEST=$(SCAFFOLD_DEST) node scripts/scaffold.mjs $(SCAFFOLD_DEST)

# ── Help ──────────────────────────────────────────────────────────────────────

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
