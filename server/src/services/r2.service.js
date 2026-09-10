import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from '../config/env.js';
import {
  MEDIA_CACHE_CONTROL,
  MEDIA_PRESIGNED_URL_SECONDS,
} from './mediaPresets.service.js';

let client = null;

export function r2Configured() {
  return Boolean(
    env.r2AccountId &&
      env.r2AccessKeyId &&
      env.r2SecretAccessKey &&
      env.r2Bucket &&
      env.r2PublicBaseUrl,
  );
}

export function getR2Client() {
  if (!r2Configured()) {
    throw new Error(
      'Cloudflare R2 media storage is not configured.',
    );
  }

  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.r2AccessKeyId,
        secretAccessKey: env.r2SecretAccessKey,
      },
    });
  }

  return client;
}

export function publicR2Url(key) {
  if (!key || !env.r2PublicBaseUrl) return '';

  const encodedPath = String(key)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${env.r2PublicBaseUrl}/${encodedPath}`;
}

export async function signR2Put({
  key,
  contentType = 'image/webp',
}) {
  const command = new PutObjectCommand({
    Bucket: env.r2Bucket,
    Key: key,
    ContentType: contentType,
    CacheControl: MEDIA_CACHE_CONTROL,
  });

  const url = await getSignedUrl(
    getR2Client(),
    command,
    {
      expiresIn: MEDIA_PRESIGNED_URL_SECONDS,
      signableHeaders: new Set([
        'content-type',
        'cache-control',
      ]),
    },
  );

  return {
    url,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': MEDIA_CACHE_CONTROL,
    },
    expiresInSeconds: MEDIA_PRESIGNED_URL_SECONDS,
  };
}

export async function headR2Object(key) {
  return getR2Client().send(
    new HeadObjectCommand({
      Bucket: env.r2Bucket,
      Key: key,
    }),
  );
}

export async function deleteR2Objects(keys = []) {
  const uniqueKeys = [
    ...new Set(keys.filter(Boolean).map(String)),
  ];

  if (!uniqueKeys.length || !r2Configured()) {
    return;
  }

  await getR2Client().send(
    new DeleteObjectsCommand({
      Bucket: env.r2Bucket,
      Delete: {
        Quiet: true,
        Objects: uniqueKeys.map((Key) => ({ Key })),
      },
    }),
  );
}


export async function getR2ObjectHeaderBytes(
  key,
  length = 12,
) {
  const response = await getR2Client().send(
    new GetObjectCommand({
      Bucket: env.r2Bucket,
      Key: key,
      Range: `bytes=0-${Math.max(0, length - 1)}`,
    }),
  );

  if (!response.Body) {
    return new Uint8Array();
  }

  return response.Body.transformToByteArray();
}
