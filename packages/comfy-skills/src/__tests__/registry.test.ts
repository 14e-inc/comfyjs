import { describe, it, expect, beforeEach } from 'vitest';
import { SkillRegistry } from '../registry';
import type { Skill } from '../types';

const mockSkill: Skill = {
  name: 'test',
  description: 'A test skill',
  async execute(input) {
    return { echo: input };
  },
};

const anotherSkill: Skill = {
  name: 'other',
  description: 'Another test skill',
  async execute() {
    return { ok: true };
  },
};

describe('SkillRegistry', () => {
  let registry: SkillRegistry;

  beforeEach(() => {
    registry = new SkillRegistry();
  });

  it('registers and retrieves a skill', () => {
    registry.register(mockSkill);
    expect(registry.get('test')).toBe(mockSkill);
  });

  it('throws on duplicate registration', () => {
    registry.register(mockSkill);
    expect(() => registry.register(mockSkill)).toThrow('already registered');
  });

  it('returns undefined for unknown skill', () => {
    expect(registry.get('nope')).toBeUndefined();
  });

  it('lists all registered skills', () => {
    registry.register(mockSkill);
    registry.register(anotherSkill);
    const list = registry.list();
    expect(list).toHaveLength(2);
    expect(list.map((s) => s.name)).toContain('test');
    expect(list.map((s) => s.name)).toContain('other');
  });

  it('list entries include name and description only', () => {
    registry.register(mockSkill);
    const [entry] = registry.list();
    expect(Object.keys(entry)).toEqual(['name', 'description']);
  });

  it('runs a skill and returns its output', async () => {
    registry.register(mockSkill);
    const result = await registry.run('test', { foo: 'bar' });
    expect(result).toEqual({ echo: { foo: 'bar' } });
  });

  it('throws when running an unregistered skill', async () => {
    await expect(registry.run('ghost', {})).rejects.toThrow('not found');
  });

  it('unregisters a skill', () => {
    registry.register(mockSkill);
    registry.unregister('test');
    expect(registry.get('test')).toBeUndefined();
    expect(registry.size).toBe(0);
  });

  it('tracks size correctly', () => {
    expect(registry.size).toBe(0);
    registry.register(mockSkill);
    expect(registry.size).toBe(1);
    registry.register(anotherSkill);
    expect(registry.size).toBe(2);
    registry.unregister('test');
    expect(registry.size).toBe(1);
  });
});
