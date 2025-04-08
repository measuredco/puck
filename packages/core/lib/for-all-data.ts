import { ComponentData, Config, Content, Data } from "../types";
import { rootAreaId, rootZone } from "./root-droppable-id";

export const forAllData = (
  data: Partial<Data>,
  cb: (
    data: ComponentData,
    parentId: string,
    zone: string,
    index: number
  ) => void,
  config?: Config
) => {
  const processContent = (content: Content, parentId: string, zone: string) => {
    content?.forEach((data, index) => {
      // console.log("Processing", parentId, data);
      const configForComponent = config?.components[data.type];

      if (configForComponent) {
        Object.keys(configForComponent.fields || {}).forEach((propKey) => {
          const field = configForComponent.fields![propKey];

          if (field.type === "slot") {
            processContent(data.props[propKey], data.props.id, propKey);
          }
        });
      }

      cb(data, parentId, zone, index);
    });
  };

  processContent(data.content || [], rootAreaId, rootZone);

  Object.entries(data.zones || {}).forEach(([zoneCompound, content]) => {
    const [parentId, zone] = zoneCompound.split(":");

    processContent(content, parentId, zone);
  });
};
