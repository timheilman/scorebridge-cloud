import { AdminGetUserCommandOutput } from "@aws-sdk/client-cognito-identity-provider";

export function cognitoUserAttributeValue(
  cognitoUser: AdminGetUserCommandOutput,
  attributeKey: string,
) {
  return cognitoUser.UserAttributes.find((a) => a.Name === attributeKey).Value;
}
