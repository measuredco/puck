import { getClassNameFactory } from "../../lib";

import styles from "./styles.module.css";

const getClassName = getClassNameFactory("DragIcon", styles);

export const DragIcon = ({ isDragDisabled }: { isDragDisabled?: boolean }) => (
  <div className={getClassName({ disabled: isDragDisabled })}>
    <svg viewBox="0 0 20 20" width="12" fill="currentColor">
      <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
    </svg>
  </div>
);
