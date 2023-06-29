import { exec } from "child_process";

function camelToScreamingSnake(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
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
  const postStackOutputPromptLines = slsInfoLines.slice(
    Math.min(
      slsInfoLines.length,
      slsInfoLines.findIndex((s) => s.match(/^Stack Outputs:/)) + 1
    )
  );
  console.log(
    postStackOutputPromptLines
      .slice(
        0,
        Math.min(
          postStackOutputPromptLines.length,
          postStackOutputPromptLines.findIndex((s) => s.match(/^[^ ]/))
        )
      )
      .map((stackOutputLine) => {
        const colonSpace = ": ";
        const keyAndRest = stackOutputLine.split(colonSpace);
        return `${camelToScreamingSnake(keyAndRest[0])}="${keyAndRest
          .slice(1)
          .join(colonSpace)}"`;
      })
      .join("\n")
  );
});
