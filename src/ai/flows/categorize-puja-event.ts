// src/ai/flows/categorize-puja-event.ts
'use server';
/**
 * @fileOverview Categorizes and tags puja events based on their 'Seva', 'Venue', and 'Activity' details.
 *
 * - categorizePujaEvent - A function that categorizes a puja event.
 * - CategorizePujaEventInput - The input type for the categorizePujaEvent function.
 * - CategorizePujaEventOutput - The return type for the categorizePujaEvent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizePujaEventInputSchema = z.object({
  seva: z.string().describe('The Seva associated with the puja event.'),
  venue: z.string().describe('The Venue where the puja event is held.'),
  activity: z.string().describe('The Activity performed during the puja event.'),
});
export type CategorizePujaEventInput = z.infer<typeof CategorizePujaEventInputSchema>;

const CategorizePujaEventOutputSchema = z.object({
  category: z.string().describe('The category of the puja event.'),
  tags: z.array(z.string()).describe('Tags associated with the puja event.'),
});
export type CategorizePujaEventOutput = z.infer<typeof CategorizePujaEventOutputSchema>;

export async function categorizePujaEvent(input: CategorizePujaEventInput): Promise<CategorizePujaEventOutput> {
  return categorizePujaEventFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizePujaEventPrompt',
  input: {schema: CategorizePujaEventInputSchema},
  output: {schema: CategorizePujaEventOutputSchema},
  prompt: `You are an expert in categorizing and tagging puja events.

  Based on the following details, determine the most appropriate category and a set of relevant tags for the event.

  Seva: {{{seva}}}
  Venue: {{{venue}}}
  Activity: {{{activity}}}

  Provide the category as a single string and the tags as an array of strings.
  `,
});

const categorizePujaEventFlow = ai.defineFlow(
  {
    name: 'categorizePujaEventFlow',
    inputSchema: CategorizePujaEventInputSchema,
    outputSchema: CategorizePujaEventOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
