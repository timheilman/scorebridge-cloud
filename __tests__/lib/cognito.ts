import { AdminGetUserCommandOutput } from "@aws-sdk/client-cognito-identity-provider";

export function cognitoUserAttributeValue(
  cognitoUser: AdminGetUserCommandOutput,
  attributeKey: string,
) {
  if (!cognitoUser.UserAttributes) {
    throw new Error("cognitoUser.UserAttributes is falsy");
  }
  return cognitoUser.UserAttributes.find((a) => a.Name === attributeKey)!
    .Value!;
}
