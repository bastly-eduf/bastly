import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

import DoctorProfile from '../models/DoctorProfile.js';
import MediaUploadSession from '../models/MediaUploadSession.js';
import RewardCard from '../models/RewardCard.js';
import { HttpError } from '../utils/httpError.js';
import {
  getMediaPreset,
  MEDIA_UPLOAD_TTL_MS,
  publicMediaPresetSummary,
} from './mediaPresets.service.js';
import {
  deleteR2Objects,
  getR2ObjectHeaderBytes,
  headR2Object,
  publicR2Url,
  r2Configured,
  signR2Put,
} from './r2.service.js';

const ENTITY_CONFIG = Object.freeze({
  doctor: Object.freeze({
    model: DoctorProfile,
    slots: Object.freeze({
      portrait: Object.freeze({
        field: 'imageMedia',
        legacyField: 'imageUrl',
      }),
    }),
  }),
  reward: Object.freeze({
    model: RewardCard,
    slots: Object.freeze({
      rewardImage: Object.freeze({
        field: 'rewardImageMedia',
        legacyField: null,
      }),
      partnerLogo: Object.freeze({
        field: 'partnerLogoMedia',
        legacyField: 'partnerLogoUrl',
      }),
    }),
  }),
});

function buildObjectKey({
  folder,
  entityId,
  slot,
  uploadId,
  variant,
}) {
  return [
    'media',
    folder,
    String(entityId),
    slot,
    uploadId,
    `${variant}.webp`,
  ].join('/');
}

function validateRequestedFiles(
  preset,
  requestedFiles,
) {
  const expectedEntries = Object.entries(
    preset.variants,
  );

  if (
    !Array.isArray(requestedFiles) ||
    requestedFiles.length !== expectedEntries.length
  ) {
    throw new HttpError(
      400,
      'Media variants do not match the Bastly preset.',
    );
  }

  const requestedMap = new Map();

  for (const file of requestedFiles) {
    if (requestedMap.has(file.variant)) {
      throw new HttpError(
        400,
        'Duplicate media variant.',
      );
    }

    requestedMap.set(file.variant, file);
  }

  return expectedEntries.map(([variant, expected]) => {
    const requested = requestedMap.get(variant);

    if (!requested) {
      throw new HttpError(
        400,
        `Missing ${variant} media variant.`,
      );
    }

    if (
      requested.width !== expected.width ||
      requested.height !== expected.height
    ) {
      throw new HttpError(
        400,
        `Invalid dimensions for ${variant}.`,
      );
    }

    if (
      requested.bytes < 1 ||
      requested.bytes > expected.maxBytes
    ) {
      throw new HttpError(
        400,
        `${variant} WebP is outside the allowed file size.`,
      );
    }

    if (requested.contentType !== 'image/webp') {
      throw new HttpError(
        400,
        'Bastly media uploads must be image/webp.',
      );
    }

    return {
      variant,
      width: expected.width,
      height: expected.height,
      bytes: requested.bytes,
      maxBytes: expected.maxBytes,
      contentType: 'image/webp',
    };
  });
}

function entityConfig(entityType, slot) {
  const config = ENTITY_CONFIG[entityType];
  const slotConfig = config?.slots?.[slot];

  if (!config || !slotConfig) {
    throw new HttpError(
      400,
      'Unsupported Bastly media destination.',
    );
  }

  return {
    ...config,
    slotConfig,
  };
}

async function requireEntity(
  entityType,
  entityId,
) {
  const config = ENTITY_CONFIG[entityType];

  if (!config) {
    throw new HttpError(400, 'Invalid media entity type.');
  }

  if (!mongoose.isValidObjectId(entityId)) {
    throw new HttpError(400, 'Invalid media target ID.');
  }

  const entity = await config.model.findById(entityId);

  if (!entity) {
    throw new HttpError(404, 'Media target not found.');
  }

  return entity;
}

function mediaVariantObject(file) {
  return {
    key: file.key,
    width: file.width,
    height: file.height,
    bytes: file.bytes,
    contentType: file.contentType,
  };
}

function assetFromSession(session) {
  const variants = {};

  for (const file of session.files) {
    variants[file.variant] = mediaVariantObject(file);
  }

  return {
    provider: 'r2',
    uploadId: session.uploadId,
    variants,
    updatedAt: new Date(),
  };
}

export function mediaKeysFromAsset(asset) {
  if (!asset?.variants) return [];

  const variants =
    typeof asset.variants.toObject === 'function'
      ? asset.variants.toObject()
      : asset.variants;

  return Object.values(variants)
    .filter(Boolean)
    .map((variant) => variant?.key)
    .filter(Boolean);
}

export function mediaVariantUrl(
  asset,
  variant,
  fallback = '',
) {
  const key = asset?.variants?.[variant]?.key;
  return key ? publicR2Url(key) : fallback || '';
}

export function mediaUrls(asset) {
  const result = {};

  for (const variant of [
    'master',
    'profile',
    'card',
    'thumb',
  ]) {
    const url = mediaVariantUrl(asset, variant);
    if (url) result[variant] = url;
  }

  return result;
}

export function doctorMediaPresentation(profile) {
  const legacy = profile?.imageUrl || '';
  const urls = mediaUrls(profile?.imageMedia);

  return {
    imageUrl:
      urls.card ||
      urls.profile ||
      urls.master ||
      legacy,
    imageVariants: urls,
  };
}

export function rewardMediaPresentation(card) {
  const logoUrls = mediaUrls(
    card?.partnerLogoMedia,
  );
  const rewardUrls = mediaUrls(
    card?.rewardImageMedia,
  );

  return {
    partnerLogoUrl:
      logoUrls.thumb ||
      logoUrls.master ||
      card?.partnerLogoUrl ||
      '',
    partnerLogoVariants: logoUrls,
    rewardImageUrl:
      rewardUrls.card ||
      rewardUrls.master ||
      '',
    rewardImageVariants: rewardUrls,
  };
}

export function mediaConfiguration() {
  return {
    enabled: r2Configured(),
    provider: 'cloudflare-r2',
    outputFormat: 'image/webp',
    maxSourceBytes: 12 * 1024 * 1024,
    maxSourcePixels: 60_000_000,
    presets: publicMediaPresetSummary(),
  };
}

export async function createMediaUpload({
  actorId,
  entityType,
  entityId,
  slot,
  files,
}) {
  if (!r2Configured()) {
    throw new HttpError(
      503,
      'Cloudflare R2 uploads are not configured yet.',
    );
  }

  const preset = getMediaPreset(entityType, slot);

  if (!preset) {
    throw new HttpError(
      400,
      'Unsupported Bastly media preset.',
    );
  }

  entityConfig(entityType, slot);
  await requireEntity(entityType, entityId);

  const validated = validateRequestedFiles(
    preset,
    files,
  );

  const uploadId = randomUUID();

  const expectedFiles = validated.map((file) => ({
    ...file,
    key: buildObjectKey({
      folder: preset.folder,
      entityId,
      slot,
      uploadId,
      variant: file.variant,
    }),
  }));

  const session = await MediaUploadSession.create({
    uploadId,
    actor: actorId,
    entityType,
    entityId,
    slot,
    files: expectedFiles,
    status: 'pending',
    expiresAt: new Date(
      Date.now() + MEDIA_UPLOAD_TTL_MS,
    ),
  });

  try {
    const uploads = await Promise.all(
      expectedFiles.map(async (file) => ({
        variant: file.variant,
        key: file.key,
        width: file.width,
        height: file.height,
        bytes: file.bytes,
        ...(await signR2Put({
          key: file.key,
          contentType: file.contentType,
        })),
      })),
    );

    return {
      uploadId: session.uploadId,
      uploads,
    };
  } catch (error) {
    await MediaUploadSession.deleteOne({
      _id: session._id,
    });
    throw error;
  }
}

function isWebpHeader(bytes) {
  if (!bytes || bytes.length < 12) return false;

  const text = String.fromCharCode(...bytes.slice(0, 12));

  return (
    text.slice(0, 4) === 'RIFF' &&
    text.slice(8, 12) === 'WEBP'
  );
}

async function verifyUploadedFiles(session) {
  for (const file of session.files) {
    let head;

    try {
      head = await headR2Object(file.key);
    } catch (error) {
      throw new HttpError(
        400,
        `The ${file.variant} upload could not be verified. Upload it again.`,
      );
    }

    const contentLength = Number(
      head.ContentLength || 0,
    );
    const contentType = String(
      head.ContentType || '',
    ).toLowerCase();

    if (
      contentLength < 1 ||
      contentLength > file.maxBytes
    ) {
      throw new HttpError(
        400,
        `The uploaded ${file.variant} file is outside the allowed size.`,
      );
    }

    if (contentType !== 'image/webp') {
      throw new HttpError(
        400,
        `The uploaded ${file.variant} file is not WebP.`,
      );
    }

    const header = await getR2ObjectHeaderBytes(
      file.key,
      12,
    );

    if (!isWebpHeader(header)) {
      throw new HttpError(
        400,
        `The uploaded ${file.variant} file does not contain a valid WebP header.`,
      );
    }

    file.bytes = contentLength;
  }
}

export async function commitMediaUpload({
  actorId,
  uploadId,
}) {
  const session = await MediaUploadSession.findOne({
    uploadId,
    actor: actorId,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    throw new HttpError(
      404,
      'This media upload session is missing or expired.',
    );
  }

  await verifyUploadedFiles(session);

  const {
    slotConfig,
  } = entityConfig(
    session.entityType,
    session.slot,
  );

  const entity = await requireEntity(
    session.entityType,
    session.entityId,
  );

  const oldAsset = entity[slotConfig.field];
  const oldKeys = mediaKeysFromAsset(oldAsset);
  const asset = assetFromSession(session);

  entity[slotConfig.field] = asset;
  await entity.save();

  session.status = 'committed';
  session.committedAt = new Date();
  await session.save();

  if (oldKeys.length) {
    deleteR2Objects(oldKeys).catch((error) => {
      console.error(
        'Could not delete replaced R2 media:',
        error.message,
      );
    });
  }

  return {
    entityType: session.entityType,
    entityId: session.entityId,
    slot: session.slot,
    asset,
    urls: mediaUrls(asset),
  };
}

export async function removeEntityMedia({
  entityType,
  entityId,
  slot,
}) {
  const {
    slotConfig,
  } = entityConfig(entityType, slot);

  const entity = await requireEntity(
    entityType,
    entityId,
  );

  const keys = mediaKeysFromAsset(
    entity[slotConfig.field],
  );

  if (keys.length && !r2Configured()) {
    throw new HttpError(
      503,
      'Cloudflare R2 must be configured before removing stored R2 media.',
    );
  }

  entity[slotConfig.field] = null;

  if (slotConfig.legacyField) {
    entity[slotConfig.legacyField] = '';
  }

  await entity.save();

  if (keys.length) {
    deleteR2Objects(keys).catch((error) => {
      console.error(
        'Could not delete removed R2 media:',
        error.message,
      );
    });
  }

  return {
    entityType,
    entityId,
    slot,
  };
}
