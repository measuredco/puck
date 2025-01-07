import { getBox } from "./get-box.mjs";
import { pause } from "./pause.mjs";

const TIME_PREFIX = 0;

export async function dragAndDrop(
  page,
  sourceSelector,
  targetSelector,
  position
) {
  const sourceBox = await getBox(page, sourceSelector);
  const targetBox = await getBox(page, targetSelector);

  // Simulate drag and drop
  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2
  );
  await page.mouse.down(); // Simulate drag start

  await pause(TIME_PREFIX + 300);

  if (position === "top") {
    // Move to top
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y - 4);

    await pause(TIME_PREFIX + 50);

    // Move to center
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2
    );
    await pause(TIME_PREFIX + 50);

    // Move to top
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y - 4);
  } else {
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2
    );
  }

  await pause(TIME_PREFIX + 10);

  await page.mouse.up(); // Simulate drop

  await pause(TIME_PREFIX + 500);
}
