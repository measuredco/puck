import { Data } from "core/types/Config";

import Client from "./client";

export default async function Page() {
  const data: Data = await fetch("http://localhost:3000/api/puck", {
    next: { revalidate: 0 },
  }).then((res) => res.json());

  return <Client data={data} />;
}
