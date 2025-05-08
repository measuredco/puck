/* eslint-disable react-hooks/rules-of-hooks */
import { createUsePuck } from "./use-puck";
import { Plugin } from "../types";
import { ActionBar } from "../components/ActionBar";
import { IconButton } from "../components/IconButton";
import { LogsIcon } from "lucide-react";

const usePuck = createUsePuck();

export const debugPlugin: Plugin = {
  overrides: {
    actionBar: ({ children, parentAction }) => {
      const item = usePuck((s) => s.selectedItem);
      return (
        <ActionBar>
          <ActionBar.Group>
            {parentAction}
            <ActionBar.Label label={item?.props.id} />
          </ActionBar.Group>

          <ActionBar.Group>{children}</ActionBar.Group>
          <ActionBar.Group>
            <ActionBar.Action onClick={() => console.log(item)}>
              <LogsIcon />
            </ActionBar.Action>
          </ActionBar.Group>
        </ActionBar>
      );
    },
    headerActions: ({ children }) => {
      const appState = usePuck((s) => s.appState);

      return (
        <>
          <IconButton
            onClick={() => {
              // No way to get appState without re-rendering
              console.log(appState);
            }}
            title="Log state"
          >
            <LogsIcon />
          </IconButton>
          {children}
        </>
      );
    },
  },
};
