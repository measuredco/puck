import { DropZoneProps } from "../components/DropZone/types";
import { WithChildren, WithPuckProps } from "./Utils";

export type PuckContext = {
  renderDropZone: React.FC<DropZoneProps>;
  isEditing: boolean;
  dragRef: ((element: Element | null) => void) | null;
};

export type DefaultRootFieldProps = {
  title?: string;
};

export type DefaultRootRenderProps<
  Props extends DefaultComponentProps = DefaultRootFieldProps
> = WithPuckProps<WithChildren<Props>>;

export type DefaultRootProps = DefaultRootRenderProps; // Deprecated

export type DefaultComponentProps = { [key: string]: any };
