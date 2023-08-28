const buildTable = (
  tableNameHyphens: string,
  addlProperties: Record<string, unknown>,
) => ({
  Type: "AWS::DynamoDB::Table",
  Properties: {
    BillingMode: "PAY_PER_REQUEST",
    ...addlProperties,
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
const buildSyntheticHashNoSortTable = (tableNameHyphens: string) =>
  buildTable(tableNameHyphens, {
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
  });

const buildClubIdMultitenantTable = (
  tableNameHyphens: string,
  rangeKeyName: string,
) =>
  buildTable(tableNameHyphens, {
    KeySchema: [
      { AttributeName: "clubId", KeyType: "HASH" },
      { AttributeName: rangeKeyName, KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      {
        AttributeName: "clubId",
        AttributeType: "S",
      },
      {
        AttributeName: rangeKeyName,
        AttributeType: "S",
      },
    ],
  });
export default {
  UsersTable: buildSyntheticHashNoSortTable("users-table"),
  ClubsTable: buildSyntheticHashNoSortTable("clubs-table"),
  ClubDevicesTable: buildClubIdMultitenantTable(
    "club-devices-table",
    "clubDeviceId",
  ),
};
