const standardChangelog = require("standard-changelog");
const path = require("path");
const fs = require("fs");

const releasePattern = /^#\s(\[?(([0-9]|\.)+)\]?.*)((.|\n)*)/gm;

const transform = (body) =>
  body.replace(releasePattern, (_, header, _2, _3, content) => {
    return `## ${header}${content}`;
  });

const changelogPath = path.join(__dirname, "../CHANGELOG.md");
const changelog = fs.readFileSync(changelogPath, "utf8");

let changes = "";

const standardStream = standardChangelog();

standardStream.on(
  "data",
  (chunk) => (changes = `${changes}${chunk.toString()}`)
);

standardStream.on("end", () => {
  // Indent headers and add download section
  const transformed = transform(changes);

  // Inject into changelog
  const updatedChangelog = changelog.replace(
    "<!--__CHANGELOG_ENTRY__-->\n",
    `<!--__CHANGELOG_ENTRY__-->\n\n${transformed}`
  );

  fs.writeFileSync(changelogPath, updatedChangelog);
});
