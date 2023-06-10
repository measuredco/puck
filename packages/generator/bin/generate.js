#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { program } from "commander";
import inquirer from "inquirer";
import Handlebars from "handlebars";
import glob from "glob";
import { execSync } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

program
  .command("create <app-name>")
  .action(async (appName) => {
    const questions = [
      {
        type: "input",
        name: "author",
        message: "What is your name?",
      },
    ];
    const answers = await inquirer.prompt(questions);

    // Copy template files to the new directory
    const templatePath = path.join(__dirname, "../templates");
    const appPath = path.join(process.cwd(), appName);

    if (fs.existsSync(appPath)) {
      console.error(
        `A directory called ${appName} already exists. Please use a different name or delete this directory.`
      );

      return;
    }

    await fs.mkdirSync(appName);

    // Compile handlebars templates
    const templateFiles = glob.sync(`**/*.hbs`, {
      cwd: templatePath,
    });

    console.log(templatePath, appPath);

    for (const templateFile of templateFiles) {
      const filePath = path.join(templatePath, templateFile);
      const targetPath = filePath
        .replace(templatePath, appPath)
        .replace(".hbs", "");

      console.log(templateFile, filePath, targetPath);

      const templateString = await fs.readFileSync(filePath, "utf-8");
      const template = Handlebars.compile(templateString);
      const result = template(answers);

      const dir = path.dirname(targetPath);

      await fs.mkdirSync(dir, { recursive: true });

      await fs.writeFileSync(targetPath, result);
    }

    // Install dependencies and format code
    // execSync("yarn install", { cwd: appPath, stdio: "inherit" });
    // execSync("yarn prettier --write .", { cwd: appPath, stdio: "inherit" });
    // execSync("git init", { cwd: appPath, stdio: "inherit" });
    // execSync("git add -a", { cwd: appPath, stdio: "inherit" });
    // execSync("git commit -m 'build(puck): generate app'", {
    //   cwd: appPath,
    //   stdio: "inherit",
    // });
  })
  .parse(process.argv);
