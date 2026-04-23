import { describe, it, expect } from 'vitest';
import {
  HelloWorldInputSchema,
  HelloWorldOutputSchema,
  ToolTextResponseSchema,
} from '../types.js';

describe('HelloWorldInputSchema', () => {
  it('accepts a valid name', () => {
    const parsed = HelloWorldInputSchema.parse({ name: 'World' });
    expect(parsed.name).toBe('World');
  });

  it('rejects a missing name', () => {
    const result = HelloWorldInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects an empty name', () => {
    const result = HelloWorldInputSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('name must not be empty');
    }
  });

  it('rejects a non-string name', () => {
    const result = HelloWorldInputSchema.safeParse({ name: 42 });
    expect(result.success).toBe(false);
  });
});

describe('HelloWorldOutputSchema', () => {
  it('accepts a valid greeting', () => {
    const parsed = HelloWorldOutputSchema.parse({ greeting: 'Hi' });
    expect(parsed.greeting).toBe('Hi');
  });

  it('rejects a missing greeting', () => {
    expect(HelloWorldOutputSchema.safeParse({}).success).toBe(false);
  });
});

describe('ToolTextResponseSchema', () => {
  it('accepts a single-text content envelope', () => {
    const parsed = ToolTextResponseSchema.parse({
      content: [{ type: 'text', text: 'ok' }],
    });
    expect(parsed.content).toHaveLength(1);
  });

  it('rejects an empty content array', () => {
    const result = ToolTextResponseSchema.safeParse({ content: [] });
    expect(result.success).toBe(false);
  });

  it('rejects a non-text content type', () => {
    const result = ToolTextResponseSchema.safeParse({
      content: [{ type: 'image', text: 'x' }],
    });
    expect(result.success).toBe(false);
  });
});
