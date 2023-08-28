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
  sortKeyName: string,
) =>
  buildTable(tableNameHyphens, {
    KeySchema: [
      { AttributeName: "clubId", KeyType: "HASH" },
      { AttributeName: sortKeyName, KeyType: "SORT" },
    ],
    AttributeDefinitions: [
      {
        AttributeName: "clubId",
        AttributeType: "S",
      },
      {
        AttributeName: sortKeyName,
        AttributeType: "S",
      },
    ],
  });
export default {
  UsersTable: buildSyntheticHashNoSortTable("users-table"),
  ClubsTable: buildSyntheticHashNoSortTable("clubs-table"),
  ClubDeviceNoncesTable: buildClubIdMultitenantTable(
    "club-device-nonces-table",
    "clubDeviceNonceId",
  ),
  ClubDevicesTable: buildClubIdMultitenantTable(
    "club-devices-table",
    "clubDeviceId",
  ),
};
