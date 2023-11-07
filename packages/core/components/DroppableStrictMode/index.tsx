// @hello-pangea/dnd doesn't play well with React 18 strict mode
//
// See https://github.com/atlassian/@hello-pangea/dnd/issues/2399#issuecomment-1175638194
import { useEffect, useState } from "react";
import { Droppable, DroppableProps } from "@hello-pangea/dnd";

const DroppableStrictMode = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};

export default DroppableStrictMode;
