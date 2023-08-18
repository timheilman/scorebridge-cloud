import readRelativeUtf8FileSync from "@libs/readRelativeUtf8FileSync";
import Handlebars from "handlebars";
const templateContext = readRelativeUtf8FileSync(
  "serverless.cognito.inviteMessageTemplate.html.cognito.hbs",
);
const template = Handlebars.compile(templateContext);

export interface InviteMessageTemplateParams {
  portalName: string;
  loginUrl: string;
}
export function inviteMessageTemplate(params: InviteMessageTemplateParams) {
  return template(params);
}
