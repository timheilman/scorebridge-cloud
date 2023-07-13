const buildSyntheticHashNoSortTable = (tableNameHyphens) => ({
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
        Value: tableNameHyphens,
      },
    ],
  },
});

export default {
  UsersTable: buildSyntheticHashNoSortTable("users-table"),
  ClubsTable: buildSyntheticHashNoSortTable("clubs-table"),
};
