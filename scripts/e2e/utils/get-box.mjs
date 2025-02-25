/**
 * Custom box function to get scaled bounding box across documents
 *
 * @param {*} page
 * @param {*} selector
 * @returns
 */
export const getBox = async (page, targetSelector) =>
  await page.evaluate((selector) => {
    function getFrameElement(el) {
      const refWindow = el?.ownerDocument.defaultView;

      if (refWindow && refWindow.self !== refWindow.parent) {
        return refWindow.frameElement;
      }

      return null;
    }

    function getFrameTransform(frameEl, boundary = window.frameElement) {
      const transform = {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
      };

      while (frameEl) {
        if (frameEl === boundary) {
          return transform;
        }

        const rect = frameEl.getBoundingClientRect();
        const { x: scaleX, y: scaleY } = getScale(frameEl, rect);

        transform.x = transform.x + rect.left;
        transform.y = transform.y + rect.top;
        transform.scaleX = transform.scaleX * scaleX;
        transform.scaleY = transform.scaleY * scaleY;

        frameEl = getFrameElement(frameEl);
      }

      return transform;
    }

    function getScale(
      element,
      boundingRectangle = element.getBoundingClientRect()
    ) {
      const width = Math.round(boundingRectangle.width);
      const height = Math.round(boundingRectangle.height);

      return {
        x: width / element.offsetWidth,
        y: height / element.offsetHeight,
      };
    }

    const frameEl = document.querySelector("#preview-frame");
    const frame = frameEl ? frameEl?.contentDocument || null : null;

    const el = document.querySelector(selector);

    if (el) {
      const rect = el.getBoundingClientRect();

      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
    } else if (frame) {
      const el = frame.querySelector(selector);

      if (!el) return null;

      const rect = el.getBoundingClientRect();
      const frameRect = frameEl.getBoundingClientRect();
      const transform = getFrameTransform(frameEl);

      return {
        x: rect.left * transform.scaleX + frameRect.left,
        y: rect.top * transform.scaleY + frameRect.top,
        width: rect.width * transform.scaleX,
        height: rect.height * transform.scaleY,
      };
    }

    return null;
  }, targetSelector);
