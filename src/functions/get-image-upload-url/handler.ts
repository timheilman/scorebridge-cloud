import { ulid } from "ulid";

import { fromEnv } from "@aws-sdk/credential-providers";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@aws-sdk/url-parser";
import { formatUrl } from "@aws-sdk/util-format-url";
import { Hash } from "@aws-sdk/hash-node";
import fromSsoUsingProfileFromEnv from "../../libs/from-sso-using-profile-from-env";
import requiredEnvVar from "../../libs/requiredEnvVar";

// TODO: SCOR-25, SCOR-26 ch4.14 and ch4.15 figure out ACL of public-read and how to enable acceleration in v3 of sdk

const createPresignedUrlWithoutClient = async ({ region, bucket, key }) => {
  const url = parseUrl(`https://${bucket}.s3-accelerate.amazonaws.com/${key}`);
  const presigner = new S3RequestPresigner({
    credentials:
      process.env.NODE_ENV === "test"
        ? fromSsoUsingProfileFromEnv()
        : fromEnv(),
    region,
    sha256: Hash.bind(null, "sha256"),
  });

  const signedUrlObject = await presigner.presign(
    new HttpRequest({ ...url, method: "PUT" })
  );
  return formatUrl(signedUrlObject);
};

// eslint-disable-next-line import/prefer-default-export
export async function main(event) {
  const id = ulid();
  let key = `${event.identity.username}/${id}`;

  const { extension } = event.arguments;
  if (extension) {
    if (extension.startsWith(".")) {
      key += extension;
    } else {
      key += `.${extension}`;
    }
  }

  const contentType = event.arguments.contentType || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("content type should be an image");
  }

  // const params = {
  //   Bucket: BUCKET_NAME,
  //   Key: key,
  //   ACL: "public-read", // TODO: SCOR-57
  //   ContentType: contentType,
  // };
  return createPresignedUrlWithoutClient({
    region: requiredEnvVar("AWS_REGION"),
    bucket: requiredEnvVar("BUCKET_NAME"),
    key,
  });
}
