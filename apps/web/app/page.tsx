"use client";

import config from "./config";
import { Data } from "core/types/Config";

export default async function Page() {
  const data: Data = await fetch("http://localhost:3000/api/puck", {
    next: { revalidate: 0 },
  }).then((res) => res.json());

  // TODO add key
  const children = data.map((item) => config[item.type].render(item.props));

  if (config.Base) {
    return <config.Base.render>{children}</config.Base.render>;
  }

  return <div>{children}</div>;
}
