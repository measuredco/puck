#!/usr/bin/env node

import fs from "fs";
import path from "path";
import glob from "glob";
import { dirname } from "path";
import { fileURLToPath } from "url";

// This is CLI location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.join(dirname(__filename));
const templatePath = path.join(__dirname, "./template");
const appPath = path.join(process.cwd());

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./package.json"))
);

const templateFiles = glob.sync(`**/*`, {
  cwd: templatePath,
  nodir: true,
  dot: true,
});

const appFiles = glob.sync(`**/*`, {
  cwd: appPath,
  nodir: true,
  dot: true,
});

const verbose = false;

const command = process.argv[process.argv.length - 1];

const gitignorePath = path.join(appPath, ".gitignore");
const gitignoreData = await fs.readFileSync(gitignorePath, "utf-8");

const copy = async (fileName) => {
  const dest = path.join(appPath, fileName);

  if (await fs.existsSync(dest)) {
    throw new Error(`Could not write ${fileName} as it already exists.`);
  }

  await fs.writeFileSync(
    dest,
    await fs.readFileSync(path.join(templatePath, fileName), "utf-8")
  );
};

if (command === "setup") {
  await fs.writeFileSync(
    gitignorePath,
    `${gitignoreData}
database.json

# next-puck routes. Removing these will eject them from next-app, but prevent next-puck from updating them.
/app/\\[...puckPath\\]
/app/puck
`
  );

  await copy("database.json");
  await copy("middleware.ts");
  await copy("next-puck.config.tsx");
  await copy("puck.config.tsx");

  process.exit();
}

const checkConflict = () => {
  const catchAllPattern = /\[\.\.\.\w+\]/;

  for (const appFile of appFiles) {
    if (
      catchAllPattern.test(appFile) &&
      appFile.indexOf("app/[...puckPath]") === -1 &&
      appFile.indexOf("app/puck") === -1
    ) {
      return appFile;
    }
  }

  return false;
};

const conflict = checkConflict();

if (
  // TODO do this on a per-route basis
  gitignoreData.indexOf("\n/app/\\[...puckPath\\]") === -1 ||
  gitignoreData.indexOf("\n/app/puck") === -1
) {
  console.log(
    `  next-puck ${packageJson.version} routes not generated as missing in .gitignore`
  );
  console.log(`  ✗  /app/[...puckPath]`);
  console.log(`  ✗  /app/puck\n`);
} else if (conflict) {
  console.log(
    ` ⚠ next-puck ${packageJson.version} routes not generated as user has conflicting route: ${conflict}`
  );
} else {
  for (const templateFile of templateFiles) {
    if (
      templateFile === "next-puck.config.tsx" ||
      templateFile === "puck.config.tsx" ||
      templateFile === "middleware.ts"
    ) {
      continue;
    }

    const filePath = path.join(templatePath, templateFile);
    const targetPath = filePath.replace(templatePath, appPath);

    if (verbose) {
      console.log(`Copying ${filePath} -> ${targetPath}`);
    }

    const data = await fs.readFileSync(filePath, "utf-8");

    const dir = path.dirname(targetPath);

    await fs.mkdirSync(dir, { recursive: true });
    await fs.writeFileSync(targetPath, data);
  }

  console.log(`  next-puck ${packageJson.version}`);
  console.log(`  ✓  Generated /app/[...puckPath]`);
  console.log(`  ✓  Generated /app/puck \n`);
}
