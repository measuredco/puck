"use client";

import { Metadata } from "@/core/types";
import { useEffect, useState } from "react";

export const useMetadata = () => {
  const [metadata, setMetadata] = useState<Metadata>({});

  const getMetadata = async () => {
    // This could be an API call or any other async operation that returns external data
    return {
      heading: "Transform your content right before rendering",
      text: "Using external data, you can now substitute content prior to rendering while leaving your original data intact.",
    };
  };

  useEffect(() => {
    getMetadata().then(setMetadata);
  }, []);

  return { metadata };
};
