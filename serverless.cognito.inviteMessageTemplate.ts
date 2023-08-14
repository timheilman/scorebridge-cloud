import fs from "fs";
import Handlebars from "handlebars";
import path from "path";
function readFileSync(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}
const templateContext = readFileSync(
  path.join(__dirname, "serverless.cognito.inviteMessageTemplate.handlebars"),
);
const template = Handlebars.compile(templateContext);

function context(stage: string) {
  if (stage === "dev") {
    return {
      portalName: "ScoreBridge-dev Admin Portal",
      loginUrl: "https://dev.d2efhllh5f21k3.amplifyapp.com/",
    };
  } else if (stage === "staging") {
    return {
      portalName: "ScoreBridge-staging Admin Portal",
      loginUrl: "https://todo.get.staging.set.up.amplifyapp.com/",
    };
  } else if (stage === "prod") {
    return {
      portalName: "ScoreBridge Admin Portal",
      loginUrl: "https://todo.get.prod.set.up.amplifyapp.com/",
    };
  } else {
    throw new Error(`Unrecognized stage ${stage}`);
  }
}

export function inviteMessageTemplate(stage: string) {
  return template(context(stage));
}
