import { AwsClient } from "aws4fetch";

const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const endpoint = process.env.R2_ENDPOINT;

export const r2BucketName = process.env.R2_BUCKET_NAME || "media-mahad-aly";
export const r2PublicUrl = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
export const r2Endpoint = endpoint;

export const isR2Configured = Boolean(
  accessKeyId &&
  secretAccessKey &&
  endpoint &&
  accessKeyId.trim().length > 0 &&
  secretAccessKey.trim().length > 0
);

export const r2Client = isR2Configured
  ? new AwsClient({
      accessKeyId: accessKeyId!.trim(),
      secretAccessKey: secretAccessKey!.trim(),
      service: "s3",
      region: "auto",
    })
  : null;
