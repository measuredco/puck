"use client";

import { rootDroppableId } from "../../lib/root-droppable-id";
import {
  Config,
  Data,
  ExtractPropsFromConfig,
  ExtractRootPropsFromConfig,
} from "../../types";
import { DropZone, DropZoneProvider } from "../DropZone";

export function Render<
  UserConfig extends Config = Config,
  UserProps extends ExtractPropsFromConfig<UserConfig> = ExtractPropsFromConfig<UserConfig>,
  UserRootProps extends ExtractRootPropsFromConfig<UserConfig> = ExtractRootPropsFromConfig<UserConfig>,
  UserData extends Data<UserProps, UserRootProps> | Data = Data<
    UserProps,
    UserRootProps
  >
>({ config, data }: { config: UserConfig; data: Partial<UserData> }) {
  const defaultedData = {
    ...data,
    root: data.root || {},
    content: data.content || [],
  };

  // DEPRECATED
  const rootProps = defaultedData.root.props || defaultedData.root;
  const title = rootProps?.title || "";

  if (config.root?.render) {
    return (
      <DropZoneProvider value={{ data: defaultedData, config, mode: "render" }}>
        <config.root.render
          {...rootProps}
          puck={{
            renderDropZone: DropZone,
            isEditing: false,
          }}
          title={title}
          editMode={false}
          id={"puck-root"}
        >
          <DropZone zone={rootDroppableId} />
        </config.root.render>
      </DropZoneProvider>
    );
  }

  return (
    <DropZoneProvider value={{ data: defaultedData, config, mode: "render" }}>
      <DropZone zone={rootDroppableId} />
    </DropZoneProvider>
  );
}
