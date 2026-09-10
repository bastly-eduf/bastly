export const MEDIA_UPLOAD_TTL_MS = 15 * 60 * 1000;
export const MEDIA_PRESIGNED_URL_SECONDS = 5 * 60;
export const MEDIA_CACHE_CONTROL =
  'public, max-age=31536000, immutable';

export const MEDIA_PRESETS = Object.freeze({
  doctor: Object.freeze({
    portrait: Object.freeze({
      folder: 'doctors',
      variants: Object.freeze({
        master: Object.freeze({
          width: 1600,
          height: 2000,
          maxBytes: 1_800_000,
        }),
        profile: Object.freeze({
          width: 900,
          height: 1125,
          maxBytes: 900_000,
        }),
        card: Object.freeze({
          width: 600,
          height: 750,
          maxBytes: 600_000,
        }),
        thumb: Object.freeze({
          width: 240,
          height: 240,
          maxBytes: 220_000,
        }),
      }),
    }),
  }),
  reward: Object.freeze({
    rewardImage: Object.freeze({
      folder: 'rewards',
      variants: Object.freeze({
        master: Object.freeze({
          width: 1600,
          height: 1000,
          maxBytes: 1_600_000,
        }),
        card: Object.freeze({
          width: 960,
          height: 600,
          maxBytes: 850_000,
        }),
        thumb: Object.freeze({
          width: 320,
          height: 200,
          maxBytes: 260_000,
        }),
      }),
    }),
    partnerLogo: Object.freeze({
      folder: 'partners',
      variants: Object.freeze({
        master: Object.freeze({
          width: 1000,
          height: 1000,
          maxBytes: 800_000,
        }),
        thumb: Object.freeze({
          width: 240,
          height: 240,
          maxBytes: 220_000,
        }),
      }),
    }),
  }),
});

export function getMediaPreset(entityType, slot) {
  return MEDIA_PRESETS[entityType]?.[slot] || null;
}

export function publicMediaPresetSummary() {
  const result = {};

  for (const [entityType, slots] of Object.entries(
    MEDIA_PRESETS,
  )) {
    result[entityType] = {};

    for (const [slot, preset] of Object.entries(slots)) {
      result[entityType][slot] = {
        variants: Object.fromEntries(
          Object.entries(preset.variants).map(
            ([name, config]) => [
              name,
              {
                width: config.width,
                height: config.height,
                maxBytes: config.maxBytes,
              },
            ],
          ),
        ),
      };
    }
  }

  return result;
}
