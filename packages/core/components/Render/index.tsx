"use client";

import { Config, Data } from "../../types/Config";

export function Render({ config, data }: { config: Config; data: Data }) {
  const children = data.content.map((item) => {
    const Component = config.components[item.type].render;

    return <Component key={item.props.id} {...item.props} />;
  });

  if (config.page) {
    return (
      <config.page.render {...data.page} editMode={false}>
        {children}
      </config.page.render>
    );
  }

  return <div>{children}</div>;
}
