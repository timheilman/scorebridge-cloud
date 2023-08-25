import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {},
  iamRoleStatementsName: `unexpectedErrorIamRoleStmts-\${sls:stage}`,
  iamRoleStatements: [],
};
