import 'dotenv/config';
import {
  HeadBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const accountId = String(
  process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
).trim();
const accessKeyId = String(
  process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
).trim();
const secretAccessKey = String(
  process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
).trim();
const bucket = String(
  process.env.CLOUDFLARE_R2_BUCKET || '',
).trim();
const publicBaseUrl = String(
  process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL || '',
).trim();

const missing = [
  ['CLOUDFLARE_R2_ACCOUNT_ID', accountId],
  ['CLOUDFLARE_R2_ACCESS_KEY_ID', accessKeyId],
  ['CLOUDFLARE_R2_SECRET_ACCESS_KEY', secretAccessKey],
  ['CLOUDFLARE_R2_BUCKET', bucket],
  ['CLOUDFLARE_R2_PUBLIC_BASE_URL', publicBaseUrl],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length) {
  console.error(
    `[Bastly] Missing R2 configuration: ${missing.join(', ')}`,
  );
  process.exit(1);
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

try {
  await client.send(
    new HeadBucketCommand({ Bucket: bucket }),
  );

  console.log(
    `[Bastly] Cloudflare R2 credentials can access bucket "${bucket}".`,
  );
  console.log(
    '[Bastly] This check does not print or expose the R2 credentials.',
  );
} catch (error) {
  console.error(
    `[Bastly] R2 verification failed: ${error.name || 'Error'} ${error.message || ''}`.trim(),
  );
  process.exit(1);
}
