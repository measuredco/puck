import asciichart from "asciichart";
import { pause } from "./utils/pause.mjs";
import { dragAndDrop } from "./utils/drag-and-drop.mjs";
import { setup } from "./utils/setup.mjs";

const PLOT = true;
const HEIGHT = 15;
const DURATION = 180;
const THRESHOLD = 300;

(async () => {
  const { browser, page } = await setup();

  console.log(
    `Puck instance loaded. Starting ${DURATION}s smoke test (threshold: ${THRESHOLD} MB)...`
  );

  let memoryUsage;
  const MB = 1024 * 1024;
  const timeout = DURATION * 1000 * 2;
  const memoryThreshold = THRESHOLD * MB;

  const memoryData = [50];

  const start = Date.now();

  const clearLines = (n) => {
    for (let i = 0; i < n; i++) {
      const y = i === 0 ? null : -1;
      process.stdout.moveCursor(0, y);
      process.stdout.clearLine(1);
    }
    process.stdout.cursorTo(0);
  };

  let plotted = false;
  let timeElapsed = 0;

  const plot = () => {
    if (memoryData.length > 0) {
      if (plotted) {
        clearLines(HEIGHT + 2);
      }

      process.stdout.write(asciichart.plot(memoryData, { height: HEIGHT }));
      process.stdout.write(`${timeElapsed}s\n`);

      plotted = true;
    }
  };

  await pause(1000);

  let memoryExceeded = false;

  try {
    while (Date.now() - start < timeout) {
      timeElapsed = ((Date.now() - start) / 1000).toFixed(2);

      await dragAndDrop(
        page,
        '[data-testid="drawer-item:Grid"]',
        '[data-testid="dropzone:default-zone"]',
        "top"
      );

      await dragAndDrop(
        page,
        '[data-testid="drawer-item:Heading"]',
        '[data-testid="dropzone:default-zone"] [data-puck-dropzone]'
      );

      memoryUsage = await page.evaluate(
        () => performance.memory.usedJSHeapSize
      );

      memoryData.push((memoryUsage / MB).toFixed(2));

      if (PLOT) {
        plot();
      } else {
        console.log(
          `(${timeElapsed}s) Memory Usage: ${(memoryUsage / MB).toFixed(2)} MB`
        );
      }

      if (memoryUsage > memoryThreshold) {
        memoryExceeded = true;

        break;
      }
    }
  } catch (err) {
    console.error("⚠️  Error during smoke test:", err);
  } finally {
    await browser.close();
  }

  if (memoryExceeded) {
    console.error(
      `⚠️  Error: Memory usage exceeded threshold in ${timeElapsed}s!`
    );
  } else {
    console.log("✅  Smoke test successful.");
  }
})();
