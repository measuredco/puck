"use client";

import { Data } from "@/core/types/Config";
import { Puck } from "@/core/components/Puck";
import { Render } from "@/core/components/Render";
import { Button } from "@/core/components/Button";
import headingAnalyzer from "@/plugin-heading-analyzer/src/HeadingAnalyzer";
import config, { UserConfig } from "../../../../config";
import {
  LocalisedHeading,
  localeContext,
} from "../../../../config/blocks/LocalisedHeading";
import { useDemoData } from "../../../../lib/use-demo-data";
import { useState } from "react";

const localisedConfig: UserConfig = {
  ...config,
  components: {
    ...config.components,
    Heading: LocalisedHeading as any,
  },
};

export function Client({
  path,
  isEdit,
  locale,
}: {
  path: string;
  isEdit: boolean;
  locale: string;
}) {
  const { data, resolvedData, key } = useDemoData({
    path: `locales/${path}`,
    isEdit,
  });

  const [currentLocale, setCurrentLocale] = useState(locale);

  if (isEdit) {
    return (
      <localeContext.Provider value={currentLocale}>
        <Puck<UserConfig>
          config={localisedConfig}
          data={data}
          onPublish={async (data: Data) => {
            localStorage.setItem(key, JSON.stringify(data));
          }}
          plugins={[headingAnalyzer]}
          headerPath={path}
          overrides={{
            headerActions: () => (
              <>
                <select
                  onChange={(e) => {
                    setCurrentLocale(e.currentTarget.value);
                  }}
                  value={currentLocale}
                  style={{ fontSize: 18, border: "none" }}
                >
                  <option value="en">en</option>
                  <option value="de">de</option>
                </select>
                <div>
                  <Button
                    href={`/locales/${currentLocale}${path}`}
                    newTab
                    variant="secondary"
                  >
                    View page
                  </Button>
                </div>
              </>
            ),
          }}
        />
      </localeContext.Provider>
    );
  }

  if (data) {
    return (
      <localeContext.Provider value={currentLocale}>
        <Render<UserConfig> config={localisedConfig} data={resolvedData} />
      </localeContext.Provider>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <h1>404</h1>
        <p>Page does not exist in session storage</p>
      </div>
    </div>
  );
}

export default Client;
