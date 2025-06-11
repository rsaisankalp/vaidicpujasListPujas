
import {genkit, type Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const genkitPlugins: Plugin<any>[] = [];
let defaultGenkitModel: string | undefined = undefined;

// Check if the GOOGLE_API_KEY is present and not just whitespace
if (process.env.GOOGLE_API_KEY && String(process.env.GOOGLE_API_KEY).trim() !== '') {
  genkitPlugins.push(googleAI());
  defaultGenkitModel = 'googleai/gemini-2.0-flash';
} else {
  // You could add a console.warn here if you want to explicitly log that AI features are disabled,
  // but per guidelines, I'm avoiding adding new console messages unless requested.
  // e.g., console.warn('GOOGLE_API_KEY not found or is empty. Google AI plugin disabled. AI features will rely on fallbacks.');
}

export const ai = genkit({
  plugins: genkitPlugins,
  model: defaultGenkitModel, // Set default model only if plugin is loaded
  // The 'logLevel' option is not available in Genkit v1.x ai() or genkit() constructor.
  // If you need to set logLevel, it would typically be part of a specific plugin's options if supported,
  // or a general Genkit configuration if available (but not in the genkit() call itself like pre-1.0).
});
