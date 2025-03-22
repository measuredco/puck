import { ComponentData, Data } from "../types";
import { rootAreaId, rootZone } from "./root-droppable-id";

export const forAllData = (
  data: Partial<Data>,
  cb: (
    data: ComponentData,
    parentId: string,
    zone: string,
    index: number
  ) => void
) => {
  data.content?.forEach((data, index) => {
    cb(data, rootAreaId, rootZone, index);
  });

  Object.entries(data.zones || {}).forEach(([zoneCompound, content]) => {
    const [parentId, zone] = zoneCompound.split(":");

    content?.forEach((data, index) => {
      cb(data, parentId, zone, index);
    });
  });
};
