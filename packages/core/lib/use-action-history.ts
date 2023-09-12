import { useState } from "react";

export function useActionHistory() {
  const [histories, setHistories] = useState([]);

  const canForward = false;
  const canRewind = false;

  return { histories, setHistories, canForward, canRewind };
}
