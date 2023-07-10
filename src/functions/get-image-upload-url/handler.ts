import { S3 } from "aws-sdk";
import { ulid } from "ulid";

const s3 = new S3({ useAccelerateEndpoint: true });

const { BUCKET_NAME } = process.env;

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

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    ACL: "public-read", // TODO: SCOR-57
    ContentType: contentType,
  };
  return s3.getSignedUrl("putObject", params);
}
