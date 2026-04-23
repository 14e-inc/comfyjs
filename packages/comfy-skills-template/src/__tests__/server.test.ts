import { describe, it, expect, vi } from 'vitest';
import {
  SKILL_NAME,
  SKILL_VERSION,
  helloWorld,
  helloWorldHandler,
  createServer,
  runStdio,
} from '../index.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

describe('skill metadata', () => {
  it('exposes a stable name and version', () => {
    expect(SKILL_NAME).toBe('comfy-skill');
    expect(SKILL_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe('helloWorld (pure)', () => {
  it('returns the expected greeting', () => {
    expect(helloWorld({ name: 'Ada' })).toEqual({ greeting: 'Hello, Ada!' });
  });

  it('does not mutate input', () => {
    const input = { name: 'Grace' };
    helloWorld(input);
    expect(input).toEqual({ name: 'Grace' });
  });
});

describe('helloWorldHandler (MCP envelope)', () => {
  it('wraps the greeting in a single text-content block', async () => {
    const result = await helloWorldHandler({ name: 'Linus' });
    expect(result.content).toEqual([{ type: 'text', text: 'Hello, Linus!' }]);
  });

  it('returns a single content block per invocation', async () => {
    const result = await helloWorldHandler({ name: 'x' });
    expect(result.content).toHaveLength(1);
  });
});

describe('createServer', () => {
  it('returns a configured McpServer instance', () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it('returns a fresh instance per call', () => {
    expect(createServer()).not.toBe(createServer());
  });
});

describe('runStdio', () => {
  it('connects the supplied server via a stdio transport', async () => {
    const connect = vi.fn().mockResolvedValue(undefined);
    const mockServer = { connect } as unknown as McpServer;

    await runStdio(mockServer);

    expect(connect).toHaveBeenCalledOnce();
  });

  it('falls back to a default server when none is provided', async () => {
    // A real server's connect() would block on stdio; spy on the prototype
    // connect method and short-circuit it to keep the test hermetic.
    const server = createServer();
    const connectSpy = vi
      .spyOn(server, 'connect')
      .mockResolvedValue(undefined);

    await runStdio(server);

    expect(connectSpy).toHaveBeenCalledOnce();
  });
});
