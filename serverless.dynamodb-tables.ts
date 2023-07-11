const buildSyntheticHashNoSortTable = (tagTableName) => ({
  Type: "AWS::DynamoDB::Table",
  Properties: {
    BillingMode: "PAY_PER_REQUEST",
    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH",
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: "id",
        AttributeType: "S",
      },
    ],
    Tags: [
      {
        Key: "Environment",
        Value: `\${sls:stage}`,
      },
      {
        Key: "Name",
        Value: tagTableName,
      },
    ],
  },
});

export const UsersTable = buildSyntheticHashNoSortTable("users-table");
export const PendingSignUpsTable = buildSyntheticHashNoSortTable(
  "pending-sign-ups-table"
);
