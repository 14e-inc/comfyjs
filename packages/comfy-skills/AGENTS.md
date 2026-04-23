# AGENTS.md (Template Blueprint)

## 🤖 System Role
You are an **Infrastructure Architect**. Your job is to maintain this "Golden Template" which is used by a Yeoman Generator to bootstrap new Agent Skills.

## 🏗 Template Philosophy
Every file in this package must be "Generator-Ready." This means:
* **Portability:** Avoid hardcoded paths that won't work outside this monorepo.
* **Placeholder Awareness:** Be mindful of where `<%= name %>` or `<%= description %>` placeholders will be inserted by the Yeoman `copyTpl` process.
* **Logic isolation:** Keep the MCP server logic modular so the generator can easily "switch on/off" certain features based on user prompts.

## 🚦 Template Maintenance Rules

### 1. The "Working Template" Rule
This package must *always* be a valid, buildable, and testable npm package on its own. 
* Do not leave broken placeholders (like `<%= name %>`) in the active `package.json`. 
* **Convention:** Use a `.template` suffix or a specific `templates/` directory if you need to store "raw" Yeoman files that would otherwise break the TypeScript compiler or ESLint.

### 2. Testing as a Scaffolding Requirement
Since **Dev/X** and **Testing** are the highest priorities:
* **Pre-baked Tests:** Every new logic feature added to this template *must* include a corresponding Vitest suite.
* **CI/CD Blueprint:** Include a `.github/workflows/skill-ci.yml` file in the template so the generated skill has "Day 0" CI/CD compatibility.
* **Placeholder Tests:** Ensure the test files use placeholders for package names so the generated tests pass immediately upon creation.

### 3. MCP & Secret Management (Bootstrapping)
* **Env Templates:** Always maintain a robust `.env.example` file.
* **Documentation:** The `SKILL.md` template must include a section for "Required Environment Variables" that the generator populates based on the user's selected integrations.

## 📦 Bootstrapping Flow
When modifying this repo, imagine the downstream flow:
1. Developer runs `yo comfy-skill`.
2. Yeoman reads this `comfy-skills` package.
3. Yeoman injects user inputs into `package.json`, `SKILL.md`, and `src/index.ts`.
4. The resulting package is an instant, testable **Agent Skill**.

---

**Note to Agent:** If you are asked to add a feature to this template, verify that the feature is generic enough to be useful for *all* bootstrapped skills. If it's too specific, suggest it as an "optional module" for the generator logic instead.