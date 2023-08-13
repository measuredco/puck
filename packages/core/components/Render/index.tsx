"use client";

import { Config, Data } from "../../types/Config";

export function Render({ config, data }: { config: Config; data: Data }) {
  const children = data.content.map((item) => {
    const Component = config.components[item.type]?.render;

    if (Component) {
      return <Component key={item.props.id} {...item.props} />;
    }

    return null;
  });

  if (config.root) {
    return (
      <config.root.render {...data.root} editMode={false}>
        {children}
      </config.root.render>
    );
  }

  return <div>{children}</div>;
}
