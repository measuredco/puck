import React, { useState } from "react";
import { generateId } from "./generate-id";

export const useSafeId = () => {
  if (typeof React.useId !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return React.useId();
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [id] = useState(generateId());

  return id;
};
