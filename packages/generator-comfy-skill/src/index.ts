import Generator from 'yeoman-generator';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Answers {
  scope: string;
  packageSlug: string;
  description: string;
  authorName: string;
  authorEmail: string;
  license: string;
  githubOrg: string;
  githubRepo: string;
  registry: string;
  skillSlug: string;
  skillDescription: string;
  includeCi: boolean;
  includeCli: boolean;
}

function toCamelCase(slug: string): string {
  return slug.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
}

function toPascalCase(slug: string): string {
  const camel = toCamelCase(slug);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

export default class ComfySkillGenerator extends Generator {
  private answers!: Answers;

  constructor(args: string | string[], opts: Record<string, unknown>) {
    super(args as string[], opts);
    // Templates live at the package root so they're included in the published
    // "files" array without compiling. __dirname is dist/, so go up one level.
    this.sourceRoot(path.join(__dirname, '..', 'templates'));
  }

  async prompting(): Promise<void> {
    this.answers = await this.prompt<Answers>([
      {
        type: 'input',
        name: 'scope',
        message: 'npm scope',
        default: '@14e-inc',
        filter: (v: string) => {
          const t = v.trim();
          return t.startsWith('@') ? t : `@${t}`;
        },
      },
      {
        type: 'input',
        name: 'packageSlug',
        message: 'package name (slug, no scope)',
        default: 'my-skills',
        filter: (v: string) => v.trim().toLowerCase().replace(/\s+/g, '-'),
      },
      {
        type: 'input',
        name: 'description',
        message: 'description',
      },
      {
        type: 'input',
        name: 'authorName',
        message: 'author name',
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: 'author email',
      },
      {
        type: 'input',
        name: 'license',
        message: 'license',
        default: 'MIT',
      },
      {
        type: 'input',
        name: 'githubOrg',
        message: 'GitHub org or username',
      },
      {
        type: 'input',
        name: 'githubRepo',
        message: 'GitHub repo name',
        default: (ans: Partial<Answers>) => ans.packageSlug,
      },
      {
        type: 'input',
        name: 'registry',
        message: 'publish registry URL',
        default: 'https://npm.pkg.github.com',
      },
      {
        type: 'input',
        name: 'skillSlug',
        message: 'first skill name (slug)',
        default: 'hello',
        filter: (v: string) => v.trim().toLowerCase().replace(/\s+/g, '-'),
      },
      {
        type: 'input',
        name: 'skillDescription',
        message: 'first skill description',
        default: (ans: Partial<Answers>) => `The ${ans.skillSlug} skill`,
      },
      {
        type: 'confirm',
        name: 'includeCi',
        message: 'include GitHub Actions CI workflow?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'includeCli',
        message: 'include CLI binary?',
        default: true,
      },
    ]);
  }

  writing(): void {
    const {
      scope, packageSlug, description, authorName, authorEmail,
      license, githubOrg, githubRepo, registry,
      skillSlug, skillDescription, includeCi, includeCli,
    } = this.answers;

    const ctx = {
      scope,
      packageSlug,
      packageName: `${scope}/${packageSlug}`,
      description,
      authorName,
      authorEmail,
      license,
      githubOrg,
      githubRepo,
      registry,
      skillSlug,
      skillDescription,
      skillCamel: toCamelCase(skillSlug),
      skillPascal: toPascalCase(skillSlug),
      includeCi,
      includeCli,
    };

    const tpl = (src: string, dest: string): void => {
      this.fs.copyTpl(this.templatePath(src), this.destinationPath(dest), ctx);
    };

    tpl('package.json.ejs', 'package.json');
    tpl('tsconfig.json.ejs', 'tsconfig.json');
    tpl('rollup.config.js.ejs', 'rollup.config.js');
    tpl('gitignore.ejs', '.gitignore');
    tpl('README.md.ejs', 'README.md');
    tpl('src/index.ts.ejs', 'src/index.ts');
    tpl('src/skill.ts.ejs', `src/${skillSlug}.ts`);
    tpl('src/__tests__/skill.test.ts.ejs', `src/__tests__/${skillSlug}.test.ts`);

    if (includeCli) {
      tpl('src/cli.ts.ejs', 'src/cli.ts');
    }

    if (includeCi) {
      tpl('github/workflows/ci.yml.ejs', '.github/workflows/ci.yml');
    }
  }

  end(): void {
    const { scope, packageSlug } = this.answers;
    this.log.writeln('');
    this.log.writeln(`✓  ${scope}/${packageSlug} scaffolded`);
    this.log.writeln('');
    this.log.writeln('Next:');
    this.log.writeln('  pnpm install');
    this.log.writeln('  pnpm test');
    this.log.writeln('  pnpm build');
  }
}
