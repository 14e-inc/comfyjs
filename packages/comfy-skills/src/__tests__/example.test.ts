import { describe, it, expect } from 'vitest';
import { echoSkill } from '../example';

describe('echoSkill', () => {
  it('echoes a message once by default', async () => {
    const { result } = await echoSkill.execute({ message: 'hello' });
    expect(result).toBe('hello');
  });

  it('repeats the message the given number of times', async () => {
    const { result } = await echoSkill.execute({ message: 'hi', repeat: 3 });
    expect(result).toBe('hi hi hi');
  });

  it('repeat of 1 returns the message unchanged', async () => {
    const { result } = await echoSkill.execute({ message: 'once', repeat: 1 });
    expect(result).toBe('once');
  });

  it('includes a valid ISO timestamp', async () => {
    const { timestamp } = await echoSkill.execute({ message: 'ts' });
    expect(new Date(timestamp).getTime()).not.toBeNaN();
  });

  it('has the expected name and description', () => {
    expect(echoSkill.name).toBe('echo');
    expect(typeof echoSkill.description).toBe('string');
    expect(echoSkill.description.length).toBeGreaterThan(0);
  });
});
