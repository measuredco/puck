import asciichart from "asciichart";
import { pause } from "./utils/pause.mjs";
import { setup } from "./utils/setup.mjs";

const CHART = false;
const CHART_HEIGHT = 15;
const DURATION = 60;
const THRESHOLD = 300;
const MB = 1024 * 1024;

const execute = async (test) => {
  const {
    duration = DURATION,
    threshold = THRESHOLD,
    chart = CHART,
    chartHeight = CHART_HEIGHT,
    puppeteerOptions,
  } = test;

  const { browser, page } = await setup(test.url, puppeteerOptions);

  if (chart) {
    console.log(
      "\x1b[36m%s\x1b[0m",
      ` ╭ ${test.label} (duration: ${duration}s, threshold: ${threshold} MB)`
    );
  }

  const timeout = duration * 1000;
  const memoryThreshold = threshold * MB;

  let memoryUsage;

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
  let timeElapsedHuman = 0;
  let iterations = 0;

  const plot = () => {
    if (chart) {
      if (memoryData.length > 0) {
        if (plotted) {
          clearLines(chartHeight + 2);
        }

        process.stdout.write(
          ` │ ${asciichart
            .plot(memoryData, { height: chartHeight })
            .replace(/\n/gm, "\n │ ")}`
        );

        process.stdout.write(
          `\n ╰ ${(memoryUsage / MB).toFixed(
            2
          )} MB (${timeElapsedHuman}s, ${iterations} iterations) `
        );
      }
    } else {
      if (plotted) {
        clearLines(1);
      }

      process.stdout.write(
        ` ├ ${test.label}: ${(memoryUsage / MB).toFixed(
          2
        )} MB (${timeElapsedHuman}s, ${iterations} iterations) `
      );
    }

    plotted = true;
  };

  await pause(1000);

  let memoryExceeded = false;

  try {
    while (true) {
      iterations += 1;

      const timeElapsed = Date.now() - start;
      timeElapsedHuman = ((Date.now() - start) / 1000).toFixed(2);

      await test.run(page);

      memoryUsage = await page.evaluate(
        () => performance.memory.usedJSHeapSize
      );

      memoryData.push((memoryUsage / MB).toFixed(2));

      plot();

      if (memoryUsage > memoryThreshold) {
        memoryExceeded = true;

        console.error(
          `❌ Test failed. Memory usage exceeded ${threshold} MB threshold in ${timeElapsedHuman}s.`
        );

        break;
      }

      if (timeElapsed > timeout) {
        break;
      }
    }

    if (!memoryExceeded) {
      plot();

      console.log(`✅ Test successful.`);
    }
  } catch (err) {
    console.error("Error during smoke test:", err);
  } finally {
    await browser.close();
  }

  return {
    memoryUsage,
    memoryExceeded,
    timeElapsedHuman,
    memoryData,
    iterations,
  };
};

export const smoke = async (tests, config) => {
  console.log(`Beginning smoke tests...`);
  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];

    results.push({
      test,
      result: await execute({ ...config, ...test }),
    });
  }

  const numSucceeded = results.reduce(
    (acc, result) => (result.result.memoryExceeded ? acc : acc + 1),
    0
  );

  console.log(`${numSucceeded}/${results.length} tests passed`);

  if (numSucceeded < 0) {
    process.exit(1);
  }
};
