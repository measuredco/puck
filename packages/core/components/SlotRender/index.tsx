"use client";

import { useAppStore } from "../../store";
import { SlotRenderPure } from "./server";
export * from "./server";

export const ContextSlotRender = ({
  componentId,
  zone,
}: {
  componentId: string;
  zone: string;
}) => {
  const config = useAppStore((s) => s.config);
  const metadata = useAppStore((s) => s.metadata);
  const slotContent = useAppStore(
    (s) => s.state.indexes.nodes[componentId]?.data.props[zone] ?? null
  );

  return (
    <SlotRenderPure
      content={slotContent}
      zone={zone}
      config={config}
      metadata={metadata}
    />
  );
};
