import {
  ComponentData,
  Config,
  Content,
  Data,
  DefaultComponentProps,
  DefaultRootFieldProps,
} from "../types";
import { resolveAllComponentData } from "./resolve-component-data";
import { resolveRootData } from "./resolve-root-data";
import { defaultData } from "./default-data";

export async function resolveAllData<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends Record<string, any> = DefaultRootFieldProps
>(
  data: Partial<Data>,
  config: Config,
  onResolveStart?: (item: ComponentData) => void,
  onResolveEnd?: (item: ComponentData) => void
) {
  const defaultedData = defaultData(data);

  const dynamicRoot = await resolveRootData<RootProps>(defaultedData, config);

  const { zones = {} } = data;

  const zoneKeys = Object.keys(zones);
  const resolvedZones: Record<string, Content<Props>> = {};

  for (let i = 0; i < zoneKeys.length; i++) {
    const zoneKey = zoneKeys[i];
    resolvedZones[zoneKey] = (await resolveAllComponentData(
      zones[zoneKey],
      config,
      onResolveStart,
      onResolveEnd
    )) as Content<Props>;
  }

  return {
    ...defaultedData,
    root: dynamicRoot,
    content: (await resolveAllComponentData(
      defaultedData.content,
      config,
      onResolveStart,
      onResolveEnd
    )) as Content<Props>,
    zones: resolvedZones,
  } as Data<Props, RootProps>;
}
