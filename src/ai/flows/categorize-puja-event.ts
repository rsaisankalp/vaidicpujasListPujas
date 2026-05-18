export type CategorizePujaEventInput = {
  seva: string;
  venue: string;
  activity: string;
};

export type CategorizePujaEventOutput = {
  category?: string;
  tags: string[];
};

const RULES: Array<[needle: string, category: string, tags: string[]]> = [
  ["homa", "Homa", ["fire-ritual"]],
  ["yagna", "Homa", ["fire-ritual"]],
  ["ganapati", "Ganapati", ["ganapati"]],
  ["ganpati", "Ganapati", ["ganapati"]],
  ["rudra", "Rudra", ["rudra", "abhisheka"]],
  ["parayan", "Parayan", ["scripture"]],
  ["archana", "Archana", ["archana"]],
  ["abhishek", "Abhisheka", ["abhisheka"]],
  ["navaratri", "Navaratri", ["devi", "festival"]],
  ["devi", "Devi", ["devi"]],
  ["guru", "Guru", ["guru"]],
];

export async function categorizePujaEvent(input: CategorizePujaEventInput): Promise<CategorizePujaEventOutput> {
  const text = `${input.seva} ${input.venue} ${input.activity}`.toLowerCase();
  const tags = new Set<string>();

  for (const [needle, , ruleTags] of RULES) {
    if (text.includes(needle)) {
      for (const tag of ruleTags) tags.add(tag);
    }
  }

  const category = RULES.find(([needle]) => text.includes(needle))?.[1] ?? "Puja";
  return { category, tags: Array.from(tags) };
}
