import type { NextApiRequest, NextApiResponse } from "next";
import { LRUCache } from "lru-cache";

type ResponseData = {
  releases: object;
};

const cache = new LRUCache({
  ttl: 1000 * 60 * 2, // 2 minutes
  ttlAutopurge: true,
});

/**
 * Proxy GitHub and rely on Next.js cache to prevent rate limiting
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const cached = cache.get("releases");

  if (cached) {
    res.status(200).json({ releases: cached });

    return;
  }

  const data = [{ name: "releases/v0.12.0", protected: false }];

  const releases: { name: string; protected: boolean }[] = data
    .filter(
      (item) =>
        item.name.indexOf("releases") === 0 &&
        item.name.indexOf(`v0.11.`) === -1 // Filter out any release branches before v0.12.0
    )
    .reverse();

  res.status(200).json({ releases });

  cache.set("releases", releases);
}
