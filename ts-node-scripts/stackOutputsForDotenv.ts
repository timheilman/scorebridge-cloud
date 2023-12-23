import { exec } from "child_process";

import { logFn } from "../src/libs/logging";
const log = logFn("ts-node-scripts.stackOutputsForDotenv.");
function camelToScreamingSnake(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
}

function findIndexes(array: string[], condition: (arg0: string) => boolean) {
  return array
    .map((element, index) => (condition(element) ? index : -1))
    .filter((index) => index !== -1);
}

function stackOutputsPromptIndex(slsInfoLines: string[]): number {
  const i = slsInfoLines.findIndex((s) => s.match(/^Stack Outputs:/));
  if (i === -1) {
    throw new Error(
      `Could not find prompt 'Stack Outputs:'. Lines: \n${slsInfoLines.join(
        "\n",
      )}`,
    );
  }
  return i;
}

function firstNonblankStartAfterPromptIndex(
  slsInfoLines: string[],
  startIndex: number,
): number {
  const blankLineIndexes = findIndexes(
    slsInfoLines,
    (l: string) => !!l.match(/^[^ ]/),
  );
  const foundBlandLineIndex = blankLineIndexes.find((n) => n >= startIndex);
  if (!foundBlandLineIndex) {
    throw new Error("Expected a blank line in output but none found.");
  }
  return foundBlandLineIndex;
}

function linesBetweenPromptAndEmptyLine(slsInfoLines: string[]) {
  const startIndex = stackOutputsPromptIndex(slsInfoLines) + 1;
  const endIndex = firstNonblankStartAfterPromptIndex(slsInfoLines, startIndex);
  if (endIndex === -1) {
    return slsInfoLines.slice(startIndex);
  }
  return slsInfoLines.slice(startIndex, endIndex);
}

function shellInputFormat(myStackOutputLines: string[]) {
  return myStackOutputLines.sort().map((stackOutputLine) => {
    const colonSpace = ": ";
    const keyAndRest = stackOutputLine.split(colonSpace);
    return `${camelToScreamingSnake(keyAndRest[0].trim())}="${keyAndRest
      .slice(1)
      .join(colonSpace)}"`;
  });
}

const stage = process.argv[2];

if (!stage) {
  log("stageNotPresent", "error", {
    message: "Please provide the stage as a command-line argument.",
  });
  process.exit(1);
}
exec(
  `npx sls info --verbose --stage ${stage}`,
  (error, stdout /* , stderr */) => {
    if (error) {
      log("npxSlsInfoVerbose.error", "error", error);
    }
    // stderr expected and ignored
    const slsInfoLines = stdout.split("\n");
    const stackOutputLines = linesBetweenPromptAndEmptyLine(slsInfoLines);
    console.log(shellInputFormat(stackOutputLines).join("\n"));
  },
);
