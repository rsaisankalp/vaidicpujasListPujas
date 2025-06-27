import { open } from 'node:fs/promises';
import { resolve } from 'node:path';

const CACHE_FILE = resolve(process.cwd(), '.aicache');

let cache: Record<string, any> | undefined = undefined;

async function load() {
  let handle;
  try {
    handle = await open(CACHE_FILE, 'r');
    const contents = await handle.readFile({ encoding: 'utf8' });
    cache = JSON.parse(contents);
  } catch (e) {
    // Ignore errors.
    cache = {};
  } finally {
    await handle?.close();
  }
}

async function save() {
  let handle;
  try {
    handle = await open(CACHE_FILE, 'w');
    await handle.writeFile(JSON.stringify(cache), { encoding: 'utf8' });
  } catch (e) {
    // Ignore error.
  } finally {
    await handle?.close();
  }
}

export async function get(key: string): Promise<any | undefined> {
  if (!cache) {
    await load();
  }
  return cache?.[key];
}

export async function set(key: string, value: any) {
  if (!cache) {
    await load();
  }
  cache![key] = value;
  await save();
}
