import {
  ComponentData,
  Config,
  Data,
  DefaultComponentProps,
  DefaultRootFieldProps,
  Metadata,
} from "../types";
import { resolveComponentData } from "./resolve-component-data";
import { resolveRootData } from "./resolve-root-data";
import { defaultData } from "./default-data";

export async function resolveAllData<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends Record<string, any> = DefaultRootFieldProps
>(
  data: Partial<Data>,
  config: Config,
  metadata: Metadata = {},
  onResolveStart?: (item: ComponentData) => void,
  onResolveEnd?: (item: ComponentData) => void
) {
  const defaultedData = defaultData(data);

  const dynamicRoot = await resolveRootData<RootProps>(
    defaultedData.root,
    config,
    metadata,
    onResolveStart
      ? (item) =>
          onResolveStart({
            ...item,
            props: { ...item.props, id: "puck-root" },
            type: "puck-root",
          })
      : undefined,
    onResolveEnd
      ? (item) =>
          onResolveEnd({
            ...item,
            props: { ...item.props, id: "puck-root" },
            type: "puck-root",
          })
      : undefined
  );

  // TODO add async support to dataMap this
  // const updatedData = dataMap(data, async (item) => {
  //   if (item.props && "id" in item.props) {
  //     return await resolveComponentData(
  //       item as ComponentData,
  //       config,
  //       metadata,
  //       onResolveStart,
  //       onResolveEnd
  //     );
  //   }

  //   return item;
  // });

  return data;

  // return {
  //   ...updatedData,
  //   root: dynamicRoot,
  // } as Data<Props, RootProps>;
}
