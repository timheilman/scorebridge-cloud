// OOPS?  should not be script?  Let's see if I can fix invocaiton of the other one using this serverless.ts tweak.

// eslint-disable-next-line import/no-extraneous-dependencies
import {
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
// eslint-disable-next-line import/no-extraneous-dependencies
import { config as dotenvConfig } from "dotenv";
// eslint-disable-next-line import/extensions,import/no-unresolved
import { fromSsoUsingProfileFromEnv } from "../src/libs/from-sso-using-profile-from-env";
import requiredEnvVar from "./requiredEnvVar";

dotenvConfig();
async function createCustomAttributeInUserPoolSchema(client): Promise<void> {
  try {
    const updateUserPoolParams = {
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Schema: [
        {
          Name: "role",
          AttributeDataType: "String",
          Mutable: false,
          Required: false,
        },
        {
          Name: "club",
          AttributeDataType: "String",
          Mutable: false,
          Required: false,
        },
        {
          Name: "club",
          AttributeDataType: "String",
          Mutable: false,
          Required: false,
        },
        // Add any additional custom attributes to the Schema array if needed
      ],
    };

    const updateUserPoolCommand = new UpdateUserPoolCommand(
      updateUserPoolParams
    );
    await client.send(updateUserPoolCommand);

    console.log(
      "Custom attribute created successfully in the user pool schema."
    );
  } catch (error) {
    console.error("Error creating custom attribute:", error);
  }
}
