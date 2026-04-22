import type { Skill } from './types';

type EchoInput = { message: string; repeat?: number };
type EchoOutput = { result: string; timestamp: string };

/**
 * Example skill — echoes a message, optionally repeated N times.
 * Use this as a template for implementing the Skill interface.
 */
export const echoSkill: Skill<EchoInput, EchoOutput> = {
  name: 'echo',
  description: 'Repeats a message the specified number of times',
  async execute(input) {
    const times = input.repeat ?? 1;
    return {
      result: Array(times).fill(input.message).join(' '),
      timestamp: new Date().toISOString(),
    };
  },
};
