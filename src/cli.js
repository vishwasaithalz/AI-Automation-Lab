import { readFile, writeFile } from "node:fs/promises";
import { MockProvider } from "./providers/mock-provider.js";
import { runWorkflow } from "./workflow.js";

async function main() {
  const args = process.argv.slice(2);
  const demo = args.includes("--demo");
  const outputIndex = args.indexOf("--output");
  const outputPath = outputIndex >= 0 ? args[outputIndex + 1] : null;
  if (outputIndex >= 0 && (!outputPath || outputPath.startsWith("--"))) {
    console.error("--output requires a file path.");
    process.exitCode = 2;
    return;
  }
  let input;

  if (demo) {
    input = {
      prompt: "Create a concise action plan from the supplied context.",
      context: "Synthetic demo context: review a small project, run tests, document limitations."
    };
  } else {
    const file = args.find((arg, index) => !arg.startsWith("--") && index !== outputIndex + 1);
    if (!file) {
      console.error("Usage: npm run demo OR npm run run -- path/to/input.json");
      process.exitCode = 2;
      return;
    }
    try {
      input = JSON.parse(await readFile(file, "utf8"));
    } catch (error) {
      console.error("Could not read valid JSON input: " + error.message);
      process.exitCode = 2;
      return;
    }
  }

  try {
    const report = await runWorkflow(input, new MockProvider());
    const serialized = JSON.stringify(report, null, 2) + "\n";
    if (outputPath) {
      await writeFile(outputPath, serialized, { encoding: "utf8", flag: "wx" });
      process.stdout.write(`Workflow report written to: ${outputPath}\n`);
    } else {
      process.stdout.write(serialized);
    }
  } catch (error) {
    console.error("Workflow error: " + error.message);
    process.exitCode = 2;
  }
}

main();
