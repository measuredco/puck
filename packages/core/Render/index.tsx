"use client";

import { Config, Data } from "../types/Config";

export function Render({ config, data }: { config: Config; data: Data }) {
  const children = data.map((item) => {
    const Component = config[item.type].render;

    return <Component key={item.props.id} {...item.props} />;
  });

  if (config.Base) {
    return <config.Base.render>{children}</config.Base.render>;
  }

  return <div>{children}</div>;
}
