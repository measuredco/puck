#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { program } from "commander";
import inquirer from "inquirer";
import Handlebars from "handlebars";
import { glob } from "glob";
import { execSync } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./package.json"))
);

// Lifted from https://github.com/vercel/next.js/blob/c2d7bbd1b82c71808b99e9a7944fb16717a581db/packages/create-next-app/helpers/get-pkg-manager.ts
function getPkgManager() {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const userAgent = process.env.npm_config_user_agent || "";

  if (userAgent.startsWith("yarn")) {
    return "yarn";
  }

  if (userAgent.startsWith("pnpm")) {
    return "pnpm";
  }

  return "npm";
}

program
  .command("create [app-name]")
  .option(
    "--use-npm",
    `

    Explicitly tell the CLI to bootstrap the application using npm
  `
  )
  .option(
    "--use-pnpm",
    `

    Explicitly tell the CLI to bootstrap the application using pnpm
  `
  )
  .option(
    "--use-yarn",
    `

    Explicitly tell the CLI to bootstrap the application using Yarn
  `
  )
  .action(async (_appName, options) => {
    const beforeQuestions = [];

    if (!_appName) {
      beforeQuestions.push({
        type: "input",
        name: "appName",
        message: "What is the name of your app?",
        required: true,
      });
    }

    const questions = [
      ...beforeQuestions,
      {
        type: "input",
        name: "recipe",
        message: "Which recipe would you like to use?",
        required: true,
        default: "next",
      },
    ];
    const answers = await inquirer.prompt(questions);
    const appName = answers.appName || _appName;
    const recipe = answers.recipe;

    // Copy template files to the new directory
    const templatePath = path.join(__dirname, "./templates", recipe);
    const appPath = path.join(process.cwd(), appName);

    if (!recipe) {
      console.error(`Please specify a recipe.`);
      return;
    }

    if (!fs.existsSync(templatePath)) {
      console.error(`No recipe named ${recipe} exists.`);
      return;
    }

    if (fs.existsSync(appPath)) {
      console.error(
        `A directory called ${appName} already exists. Please use a different name or delete this directory.`
      );
      return;
    }

    await fs.mkdirSync(appName);

    const packageManager = !!options.useNpm
      ? "npm"
      : !!options.usePnpm
      ? "pnpm"
      : !!options.useYarn
      ? "yarn"
      : getPkgManager();

    // Compile handlebars templates
    const templateFiles = glob.sync(`**/*`, {
      cwd: templatePath,
      nodir: true,
      dot: true,
    });

    for (const templateFile of templateFiles) {
      const filePath = path.join(templatePath, templateFile);
      const targetPath = filePath
        .replace(templatePath, appPath)
        .replace(".hbs", "")
        .replace("gitignore", ".gitignore"); // .gitignore gets ignored by npm during publish, so we have to rename it

      let data;

      if (path.extname(filePath) === ".hbs") {
        const templateString = await fs.readFileSync(filePath, "utf-8");

        const template = Handlebars.compile(templateString);
        data = template({
          ...answers,
          appName,
          puckVersion: `^${packageJson.version}`,
        });
      } else {
        data = await fs.readFileSync(filePath, "utf-8");
      }

      const dir = path.dirname(targetPath);

      await fs.mkdirSync(dir, { recursive: true });

      await fs.writeFileSync(targetPath, data);
    }

    if (packageManager === "yarn") {
      execSync("yarn install", { cwd: appPath, stdio: "inherit" });
    } else {
      execSync(`${packageManager} i`, { cwd: appPath, stdio: "inherit" });
    }

    let inGitRepo = false;

    try {
      inGitRepo =
        execSync("git status", {
          cwd: appPath,
        })
          .toString()
          .indexOf("fatal:") !== 0;
    } catch {}

    // Only commit if this is a new repo
    if (!inGitRepo) {
      execSync("git init", { cwd: appPath, stdio: "inherit" });

      execSync("git add .", { cwd: appPath, stdio: "inherit" });
      execSync("git commit -m 'build(puck): generate app'", {
        cwd: appPath,
        stdio: "inherit",
      });
    }
  })
  .parse(process.argv);
