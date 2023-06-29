import { exec } from "child_process";

function camelToScreamingSnake(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
}

function linesPastStackOutputPrompt(slsInfoLines: string[]) {
  return slsInfoLines.slice(
    Math.min(
      slsInfoLines.length,
      slsInfoLines.findIndex((s) => s.match(/^Stack Outputs:/)) + 1
    )
  );
}

function stackOutputLines(postStackOutputPromptLines: string[]) {
  return postStackOutputPromptLines.slice(
    0,
    Math.min(
      postStackOutputPromptLines.length,
      postStackOutputPromptLines.findIndex((s) => s.match(/^[^ ]/))
    )
  );
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
    shellInputFormat(
      stackOutputLines(linesPastStackOutputPrompt(slsInfoLines))
    ).join("\n")
  );
});
