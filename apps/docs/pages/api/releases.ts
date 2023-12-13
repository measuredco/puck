import type { NextApiRequest, NextApiResponse } from "next";

import releases from "../../releases.json";

/**
 * Proxy GitHub and rely on Next.js cache to prevent rate limiting
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({ releases });
}
