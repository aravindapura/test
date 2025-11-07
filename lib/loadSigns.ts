import fs from 'fs/promises';
import path from 'path';
import { FootSign, FootSignData } from './signs';

export interface LoadSignsResult {
  signs: FootSign[];
  dataPath: string;
}

export async function loadSigns(slug: string): Promise<LoadSignsResult> {
  const dataPath = `data/signs/${slug}.json`;
  const absoluteDataPath = path.join(process.cwd(), dataPath);

  let signs: FootSign[] = [];
  try {
    const raw = await fs.readFile(absoluteDataPath, 'utf-8');
    const parsed = JSON.parse(raw) as FootSignData;
    if (Array.isArray(parsed.signs)) {
      signs = parsed.signs;
    }
  } catch (error) {
    // file might not exist yet; ignore errors
  }

  return { signs, dataPath };
}

export async function imageExists(publicPath: string): Promise<boolean> {
  const cleanPath = publicPath.replace(/^\//, '');
  const imagePath = path.join(process.cwd(), 'public', cleanPath);
  try {
    await fs.access(imagePath);
    return true;
  } catch (error) {
    return false;
  }
}
