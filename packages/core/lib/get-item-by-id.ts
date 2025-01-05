import { useDataIndexStore } from "../stores/data-index";
import { ComponentData, Data } from "../types";

export function getItemById<UserData extends Data>(
  data: UserData,
  id: string
): UserData["content"][0] | undefined {
  const { index } = useDataIndexStore.getState();

  const originalPath = index[id].path;

  if (!originalPath) return;

  const path = [...originalPath];
  let currentSegment = path.shift();
  let item: ComponentData = {
    type: "",
    props: { id: "", content: data.content },
  };

  while (currentSegment) {
    item = item.props[currentSegment.propName][currentSegment.index];
    currentSegment = path.shift();

    if (!item) {
      return;
    }
  }

  return item;
}
