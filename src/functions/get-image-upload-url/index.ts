import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    BUCKET_NAME: { Ref: "AssetsBucket" },
  },
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: ["s3:PutObject", "s3:PutObjectAcl"],
      Resource: {
        "Fn::Sub": `\${AssetsBucket.Arn}/*`,
        // `\${ABA}/*`,
        // { ABA: { "Fn::GetAtt": ["AssetsBucket", "Arn"] } },
      },
    },
  ],
};
