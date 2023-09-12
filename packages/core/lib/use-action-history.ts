import { useState } from "react";

export function useActionHistory() {
  const [histories, setHistories] = useState([]);

  return { histories, setHistories };
}
