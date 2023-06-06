import { Data } from "core/types/Config";
import Client from "./client";

export default async function Page() {
  let data: Data = await fetch("http://localhost:3000/api/puck").then((res) =>
    res.json()
  );

  return <Client data={data} />;
}
