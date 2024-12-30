import { getBox } from "./get-box.mjs";
import { pause } from "./pause.mjs";

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

  await pause(300);

  if (position === "top") {
    // Move below
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height * 2
    );

    await pause(10);

    // Move to top
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + 4 // move to top to trigger directional move
    );
  } else {
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2
    );

    await pause(10);

    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2 + 1 // wiggle
    );
  }

  await page.mouse.up(); // Simulate drop

  await pause(300);
}
