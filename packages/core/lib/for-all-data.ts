import { ZoneType } from "../store/slices/zones";
import { ComponentData, Config, Content, Data } from "../types";
import { rootAreaId, rootZone } from "./root-droppable-id";

export const forAllData = (
  data: Partial<Data>,
  cb: (
    data: ComponentData,
    parentId: string,
    zone: string,
    index: number,
    zoneType: ZoneType
  ) => void,
  config?: Config
) => {
  const processContent = (
    content: Content,
    parentId: string,
    zone: string,
    metadata: { type: ZoneType }
  ) => {
    content?.forEach((data, index) => {
      // console.log("Processing", parentId, data);
      const configForComponent = config?.components[data.type];

      if (configForComponent) {
        Object.keys(configForComponent.fields || {}).forEach((propKey) => {
          const field = configForComponent.fields![propKey];

          if (field.type === "slot") {
            processContent(data.props[propKey], data.props.id, propKey, {
              type: "slot",
            });
          }
        });
      }

      cb(data, parentId, zone, index, metadata.type);
    });
  };

  processContent(data.content || [], rootAreaId, rootZone, { type: "root" });

  Object.entries(data.zones || {}).forEach(([zoneCompound, content]) => {
    const [parentId, zone] = zoneCompound.split(":");

    processContent(content, parentId, zone, { type: "dropzone" });
  });
};
