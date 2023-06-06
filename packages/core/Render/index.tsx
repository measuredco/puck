"use client";

import { Config, Data } from "core/types/Config";

export function Render({ config, data }: { config: Config; data: Data }) {
  // TODO add key
  const children = data.map((item) => config[item.type].render(item.props));

  if (config.Base) {
    return <config.Base.render>{children}</config.Base.render>;
  }

  return <div>{children}</div>;
}
