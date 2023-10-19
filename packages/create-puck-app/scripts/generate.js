#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { glob } from "glob";
import { dirname } from "path";
import { fileURLToPath } from "url";

const verbose = false;

const run = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Copy template files to the new directory
  const recipePath = path.join(__dirname, "../../../recipes");
  const templatePath = path.join(__dirname, "../templates");

  if (!fs.existsSync(recipePath)) {
    console.error(`No recipe directory could be found at ${recipePath}.`);
    return;
  }

  if (!fs.existsSync(templatePath)) {
    console.error(`No template directory could be found at ${templatePath}.`);
    return;
  }

  // Compile handlebars templates
  const recipeFiles = glob.sync(`**/*`, {
    cwd: recipePath,
    nodir: true,
    dot: true,
  });

  console.warn(
    `⚠️   The following files use handlebars templates. Please manually update them:`
  );

  let counter = 0;

  for (const recipeFile of recipeFiles) {
    const filePath = path.join(recipePath, recipeFile);

    const targetPath = filePath
      .replace(recipePath, templatePath)
      .replace(".gitignore", "gitignore"); // rename .gitignore to gitignore so NPM publish doesn't ignore it

    // Don't copy file if it's templated by handlebars
    if (fs.existsSync(`${targetPath}.hbs`)) {
      console.warn(`- ${recipeFile}`);
    } else {
      if (verbose) {
        console.log(`Copying ${filePath} -> ${targetPath}`);
      }

      const data = await fs.readFileSync(filePath, "utf-8");

      const dir = path.dirname(targetPath);

      await fs.mkdirSync(dir, { recursive: true });

      await fs.writeFileSync(targetPath, data);

      counter += 1;
    }
  }

  console.log(`Copied ${counter} files into generator!`);
};

await run();
