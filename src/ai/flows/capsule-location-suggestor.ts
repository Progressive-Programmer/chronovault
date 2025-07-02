// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview Suggests a physical location for opening a time capsule based on the message content.
 *
 * - suggestCapsuleLocation - A function that suggests a location for the capsule opening.
 * - SuggestCapsuleLocationInput - The input type for the suggestCapsuleLocation function.
 * - SuggestCapsuleLocationOutput - The return type for the suggestCapsuleLocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCapsuleLocationInputSchema = z.object({
  messageContent: z
    .string()
    .describe('The content of the time capsule message.'),
});
export type SuggestCapsuleLocationInput = z.infer<
  typeof SuggestCapsuleLocationInputSchema
>;

const SuggestCapsuleLocationOutputSchema = z.object({
  suggestedLocation: z
    .string()
    .describe('A suggested physical location for opening the time capsule.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the location suggestion.'),
});
export type SuggestCapsuleLocationOutput = z.infer<
  typeof SuggestCapsuleLocationOutputSchema
>;

export async function suggestCapsuleLocation(
  input: SuggestCapsuleLocationInput
): Promise<SuggestCapsuleLocationOutput> {
  return suggestCapsuleLocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'capsuleLocationSuggestorPrompt',
  input: {schema: SuggestCapsuleLocationInputSchema},
  output: {schema: SuggestCapsuleLocationOutputSchema},
  prompt: `Given the content of a time capsule message, suggest a suitable physical location for opening it and the reasoning behind that suggestion.

Message Content: {{{messageContent}}}

Respond with a location and reasoning for the choice.`,
});

const suggestCapsuleLocationFlow = ai.defineFlow(
  {
    name: 'suggestCapsuleLocationFlow',
    inputSchema: SuggestCapsuleLocationInputSchema,
    outputSchema: SuggestCapsuleLocationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
