import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { fileURLToPath } from 'node:url';
import {
  HelloWorldInputSchema,
  type HelloWorldInput,
  type HelloWorldOutput,
  type ToolTextResponse,
} from './types.js';

export const SKILL_NAME = 'comfy-skill';
export const SKILL_VERSION = '0.1.0';

/**
 * Pure business-logic layer for the `hello_world` tool.
 * Separated from the MCP wiring so it can be unit-tested without a server.
 */
export function helloWorld(input: HelloWorldInput): HelloWorldOutput {
  return { greeting: `Hello, ${input.name}!` };
}

/**
 * MCP tool handler — wraps `helloWorld` in the MCP content-block envelope.
 */
export async function helloWorldHandler(
  input: HelloWorldInput,
): Promise<ToolTextResponse> {
  const { greeting } = helloWorld(input);
  return {
    content: [{ type: 'text', text: greeting }],
  };
}

/**
 * Constructs an MCP server pre-registered with this skill's tools.
 * Reusable as a library export; also used by the stdio runner below.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: SKILL_NAME,
    version: SKILL_VERSION,
  });

  server.tool(
    'hello_world',
    'Greets the given name. Example tool demonstrating the AgentSkills + MCP contract.',
    HelloWorldInputSchema.shape,
    helloWorldHandler,
  );

  return server;
}

/**
 * Boots a stdio MCP transport against the given server (or a fresh one).
 * Isolated so tests can inject a mock server.
 */
export async function runStdio(
  server: McpServer = createServer(),
): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export { HelloWorldInputSchema, HelloWorldOutputSchema } from './types.js';
export type {
  HelloWorldInput,
  HelloWorldOutput,
  ToolTextResponse,
} from './types.js';

/* v8 ignore start -- standalone bin invocation, not meaningful under unit tests */
if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  runStdio().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
/* v8 ignore stop */
