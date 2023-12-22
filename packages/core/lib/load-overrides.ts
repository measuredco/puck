import { Overrides } from "../types/Overrides";
import { Plugin } from "../types/Plugin";

export const loadOverrides = ({
  overrides,
  plugins,
}: {
  overrides: Partial<Overrides>;
  plugins: Plugin[];
}) => {
  const collected = { ...overrides };

  plugins.forEach((plugin) => {
    Object.keys(plugin.overrides).forEach((overridesType) => {
      if (overridesType === "fieldTypes") {
        const fieldTypes = plugin.overrides.fieldTypes!;
        Object.keys(fieldTypes).forEach((fieldType) => {
          collected.fieldTypes = collected.fieldTypes || {};

          const childNode = collected.fieldTypes[fieldType];

          const Comp = (props) =>
            fieldTypes[fieldType]!({
              ...props,
              children: childNode ? childNode(props) : props.children,
            });

          collected.fieldTypes[fieldType] = Comp;
        });

        return;
      }

      const childNode = collected[overridesType];

      const Comp = (props) =>
        plugin.overrides[overridesType]({
          ...props,
          children: childNode ? childNode(props) : props.children,
        });

      collected[overridesType] = Comp;
    });
  });

  return collected;
};
