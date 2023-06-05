"use client";

import Puck from "./Puck";
import config, { initialData } from "../lib/config";

export default function Page() {
  return <Puck config={config} initialData={initialData} />;
}
