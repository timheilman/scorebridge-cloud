import { exec } from "child_process";

function camelToScreamingSnake(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
}

function findIndexes(array, condition) {
  return array
    .map((element, index) => (condition(element) ? index : -1))
    .filter((index) => index !== -1);
}

function stackOutputsPromptIndex(slsInfoLines) {
  const i = slsInfoLines.findIndex((s) => s.match(/^Stack Outputs:/));
  if (i === -1) {
    throw new Error("Could not find prompt 'Stack Outputs:'");
  }
  return i;
}

function firstBlankIndexAfterPrompt(slsInfoLines: string[], startIndex) {
  const blankLineIndexes = findIndexes(slsInfoLines, (l) => l.match(/^[^ ]/));
  return blankLineIndexes.find((n) => n >= startIndex);
}

function linesBetweenPromptAndEmptyLine(slsInfoLines: string[]) {
  const startIndex = stackOutputsPromptIndex(slsInfoLines) + 1;
  const endIndex = firstBlankIndexAfterPrompt(slsInfoLines, startIndex);
  if (endIndex === -1) {
    return slsInfoLines.slice(startIndex);
  }
  return slsInfoLines.slice(startIndex, endIndex);
}

function shellInputFormat(myStackOutputLines: string[]) {
  return myStackOutputLines.map((stackOutputLine) => {
    const colonSpace = ": ";
    const keyAndRest = stackOutputLine.split(colonSpace);
    return `${camelToScreamingSnake(keyAndRest[0].trim())}="${keyAndRest
      .slice(1)
      .join(colonSpace)}"`;
  });
}

exec("npx sls info --verbose", (error, stdout /* , stderr */) => {
  if (error) {
    console.log(
      `build error: unable to pull stack outputs from serverless framework`
    );
    console.log(`build error: ${error.message}`);
  }
  // stderr expected and ignored
  const slsInfoLines = stdout.split("\n");
  console.log(
    shellInputFormat(linesBetweenPromptAndEmptyLine(slsInfoLines)).join("\n")
  );
});
