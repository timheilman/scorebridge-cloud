import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { config as dotenvConfig } from "dotenv";
import fromSsoUsingProfileFromEnv from "../../src/libs/from-sso-using-profile-from-env";

dotenvConfig();

const userExistsInUsersTable = async (id: string) => {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "NO_REGION_FOUND_IN_ENV",
    credentials: fromSsoUsingProfileFromEnv(),
  });

  console.log(`looking for user [${id}] in table [${process.env.USERS_TABLE}]`);
  const command = new GetItemCommand({
    TableName: process.env.USERS_TABLE,
    Key: marshall({
      id,
    }),
  });

  const response = await client.send(command);
  const item = unmarshall(response.Item);

  if (item) {
    return item;
  }

  throw new Error(
    `User with ID [${id}] not found in table [${process.env.USERS_TABLE}]`
  );
};

// eslint-disable-next-line import/prefer-default-export
export { userExistsInUsersTable };
