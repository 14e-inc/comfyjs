import { z } from 'zod';

/**
 * Input schema for the `hello_world` MCP tool.
 * Validated at runtime before the tool handler runs.
 */
export const HelloWorldInputSchema = z.object({
  name: z
    .string()
    .min(1, 'name must not be empty')
    .describe('Name of the entity to greet'),
});
export type HelloWorldInput = z.infer<typeof HelloWorldInputSchema>;

/**
 * Output schema for `hello_world` before it is wrapped in an MCP content block.
 */
export const HelloWorldOutputSchema = z.object({
  greeting: z.string(),
});
export type HelloWorldOutput = z.infer<typeof HelloWorldOutputSchema>;

/**
 * Shape of an MCP text-content tool response.
 * Kept narrow on purpose — extend here when adding richer content types.
 */
export const ToolTextResponseSchema = z.object({
  content: z
    .array(
      z.object({
        type: z.literal('text'),
        text: z.string(),
      }),
    )
    .nonempty(),
});
export type ToolTextResponse = z.infer<typeof ToolTextResponseSchema>;
