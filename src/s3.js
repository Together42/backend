import aws from "aws-sdk";
import { config } from "./config.js";

export const s3 = new aws.S3({
  accessKeyId: config.s3.access_key_id,
  secretAccessKey: config.s3.secret_access_key,
  bucket: config.s3.bucket,
  region: config.s3.region,
});
