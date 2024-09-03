import { Plugin } from "@/core/types";
import { useEffect, useState } from "react";

import createCache, { EmotionCache } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

const createEmotionCachePlugin = (key: string): Plugin => {
  return {
    overrides: {
      iframe: ({ children, document }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [cache, setCache] = useState<EmotionCache | null>(null);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (document) {
            setCache(
              createCache({
                key,
                container: document.head,
              })
            );
          }
        }, [document, key]);

        if (cache) {
          return <CacheProvider value={cache}>{children}</CacheProvider>;
        }

        return <>{children}</>;
      },
    },
  };
};

export default createEmotionCachePlugin;
