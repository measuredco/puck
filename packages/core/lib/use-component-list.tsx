import { ReactNode, useEffect, useState } from "react";
import { Config } from "../types/Config";
import { ComponentList } from "../components/ComponentList";

export const useComponentList = (config: Config) => {
  const [componentList, setComponentList] = useState<ReactNode[]>();

  useEffect(() => {
    if (config.categories) {
      const matchedComponents: string[] = [];

      let _componentList: ReactNode[];

      _componentList = Object.entries(config.categories).map(
        ([categoryKey, category]) => {
          if (category.visible === false || !category.components) {
            return null;
          }

          return (
            <ComponentList
              key={categoryKey}
              title={category.title || categoryKey}
              defaultExpanded={category.defaultExpanded}
            >
              {category.components.map((componentName, i) => {
                matchedComponents.push(componentName as string);

                return (
                  <ComponentList.Item
                    key={componentName}
                    component={componentName as string}
                    index={i}
                  />
                );
              })}
            </ComponentList>
          );
        }
      );

      const remainingComponents = Object.keys(config.components).filter(
        (component) => matchedComponents.indexOf(component) === -1
      );

      if (
        remainingComponents.length > 0 &&
        !config.categories["other"]?.components &&
        config.categories["other"]?.visible !== false
      ) {
        _componentList.push(
          <ComponentList
            key="other"
            title={"Other"}
            defaultExpanded={config.categories.other?.defaultExpanded}
          >
            {remainingComponents.map((componentName, i) => {
              return (
                <ComponentList.Item
                  key={componentName}
                  component={componentName as string}
                  index={i}
                />
              );
            })}
          </ComponentList>
        );
      }

      setComponentList(_componentList);
    }
  }, [config.categories, config.components]);

  return componentList;
};
