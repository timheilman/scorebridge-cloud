import fs from "fs";
import Handlebars from "handlebars";
import path from "path";
async function readFile(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
const templateContent = readFile(
  path.join(__dirname, "serverless.cognito.inviteMessageTemplate.handlebars"),
);
const template = Handlebars.compile(templateContent);

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
      portalName: "ScoreBridge-staging Admin Portal",
      loginUrl: "https://todo.get.prod.set.up.amplifyapp.com/",
    };
  } else {
    throw new Error(`Unrecognized stage ${stage}`);
  }
}

export function inviteMessageTemplate(stage: string) {
  return template(context(stage));
}
