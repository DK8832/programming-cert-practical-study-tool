import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(projectRoot, "dist");

const [html, css, questionsSource, coreSource, appSource] = await Promise.all([
  readFile(resolve(projectRoot, "index.html"), "utf8"),
  readFile(resolve(projectRoot, "styles.css"), "utf8"),
  readFile(resolve(projectRoot, "questions.js"), "utf8"),
  readFile(resolve(projectRoot, "core.mjs"), "utf8"),
  readFile(resolve(projectRoot, "app.js"), "utf8"),
]);

const questions = questionsSource.replace(/^export\s+/m, "");
const core = coreSource.replaceAll("export ", "");
const app = appSource.replace(/^import[\s\S]*?from\s+"\.\/core\.mjs";\s*/m, "");

const standalone = html
  .replace('<link rel="stylesheet" href="./styles.css" />', `<style>\n${css}\n</style>`)
  .replace(
    '<script type="module" src="./app.js"></script>',
    `<script type="module">\n${questions}\n${core}\n${app}\n</script>`,
  );

await mkdir(outputDir, { recursive: true });
const output = resolve(outputDir, "CODE90_standalone.html");
await writeFile(output, standalone, "utf8");
console.log(output);

