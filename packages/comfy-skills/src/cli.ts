import { SkillRegistry } from './registry';
import { echoSkill } from './example';

const registry = new SkillRegistry();
registry.register(echoSkill);

const [, , command, ...args] = process.argv;

function printHelp(): void {
  console.log(`
comfy-skills — composable skills module CLI

Usage:
  comfy-skills list              List all registered skills
  comfy-skills run <name> [json] Run a skill with optional JSON input
  comfy-skills --help            Show this help

Examples:
  comfy-skills list
  comfy-skills run echo '{"message":"hello","repeat":3}'
`);
}

async function main(): Promise<void> {
  switch (command) {
    case 'list': {
      const skills = registry.list();
      if (skills.length === 0) {
        console.log('No skills registered.');
        break;
      }
      console.log('Available skills:\n');
      skills.forEach(({ name, description }) =>
        console.log(`  ${name.padEnd(24)} ${description}`)
      );
      break;
    }

    case 'run': {
      const [name, jsonArg] = args;
      if (!name) {
        console.error('Error: skill name required\n\nUsage: comfy-skills run <name> [json]');
        process.exit(1);
      }
      let input: Record<string, unknown> = {};
      if (jsonArg) {
        try {
          input = JSON.parse(jsonArg) as Record<string, unknown>;
        } catch {
          console.error('Error: input must be valid JSON');
          process.exit(1);
        }
      }
      try {
        const result = await registry.run(name, input);
        console.log(JSON.stringify(result, null, 2));
      } catch (err) {
        console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
      }
      break;
    }

    case '--help':
    case '-h':
    case undefined:
      printHelp();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
