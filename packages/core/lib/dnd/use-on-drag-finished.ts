import { useCallback } from "react";
import { useAppStoreApi } from "../../store";

export const useOnDragFinished = (
  cb: (finished: boolean) => void,
  deps: any[] = []
) => {
  const appStore = useAppStoreApi();

  return useCallback(() => {
    let dispose: () => void = () => {};

    const processDragging = (isDragging: boolean) => {
      if (isDragging) {
        cb(false);
      } else {
        cb(true);

        if (dispose) dispose();
      }
    };

    const isDragging = appStore.getState().state.ui.isDragging;

    processDragging(isDragging);

    if (isDragging) {
      dispose = appStore.subscribe(
        (s) => s.state.ui.isDragging,
        (isDragging) => {
          processDragging(isDragging);
        }
      );
    }

    return dispose;
  }, [appStore, ...deps]);
};
