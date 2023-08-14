import fs from "fs";
import Handlebars from "handlebars";
import path from "path";
function readFileSync(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}
const templateContext = readFileSync(
  path.join(
    __dirname,
    "serverless.cognito.inviteMessageTemplate.html.cognito.hbs",
  ),
);
const template = Handlebars.compile(templateContext);

export interface InviteMessageTemplateParams {
  portalName: string;
  loginUrl: string;
}
export function inviteMessageTemplate(params: InviteMessageTemplateParams) {
  return template(params);
}
