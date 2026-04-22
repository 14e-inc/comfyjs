export type SkillInput = Record<string, unknown>;
export type SkillOutput = unknown;

export interface Skill<
  I extends SkillInput = SkillInput,
  O extends SkillOutput = SkillOutput,
> {
  readonly name: string;
  readonly description: string;
  execute(input: I): Promise<O>;
}

export type SkillDefinition<
  I extends SkillInput = SkillInput,
  O extends SkillOutput = SkillOutput,
> = {
  name: string;
  description: string;
  execute: (input: I) => Promise<O>;
};
