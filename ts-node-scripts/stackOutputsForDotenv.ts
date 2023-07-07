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

function firstNonblankStartAfterPromptIndex(
  slsInfoLines: string[],
  startIndex
) {
  const blankLineIndexes = findIndexes(slsInfoLines, (l) => l.match(/^[^ ]/));
  return blankLineIndexes.find((n) => n >= startIndex);
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
  return myStackOutputLines.map((stackOutputLine) => {
    const colonSpace = ": ";
    const keyAndRest = stackOutputLine.split(colonSpace);
    return `${camelToScreamingSnake(keyAndRest[0].trim())}="${keyAndRest
      .slice(1)
      .join(colonSpace)}"`;
  });
}

function graphQlApiUrl(slsInfoLines: string[]) {
  const apiUrlIndex = slsInfoLines.findIndex((l) => l.match(/^ {2}graphql: /));
  if (apiUrlIndex === -1) {
    throw new Error("No graphQL api URL found in sls info output");
  }
  return slsInfoLines[apiUrlIndex].match(/^ {2}graphql: (.*)$/)[1];
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
    `${shellInputFormat(linesBetweenPromptAndEmptyLine(slsInfoLines)).join(
      "\n"
    )}
API_URL=${graphQlApiUrl(slsInfoLines)}\n`
  );
});
