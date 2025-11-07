import type { NextApiRequest, NextApiResponse } from 'next';
import { deities, DeitySlug } from '../../../lib/deities';
import { loadSigns } from '../../../lib/loadSigns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { deity } = req.query;
  const slug = Array.isArray(deity) ? deity[0] : deity;

  if (!slug || !(slug in deities)) {
    res.status(404).json({ error: 'Unknown deity' });
    return;
  }

  const { signs } = await loadSigns(slug as DeitySlug);
  res.status(200).json({ signs });
}
