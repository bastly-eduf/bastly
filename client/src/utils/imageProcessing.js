const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_SOURCE_PIXELS = 60_000_000;

export const IMAGE_PRESETS = Object.freeze({
  portrait: Object.freeze({
    fit: 'cover',
    quality: 0.84,
    variants: Object.freeze({
      master: { width: 1600, height: 2000 },
      profile: { width: 900, height: 1125 },
      card: { width: 600, height: 750 },
      thumb: { width: 240, height: 240 },
    }),
  }),
  reward: Object.freeze({
    fit: 'cover',
    quality: 0.84,
    variants: Object.freeze({
      master: { width: 1600, height: 1000 },
      card: { width: 960, height: 600 },
      thumb: { width: 320, height: 200 },
    }),
  }),
  logo: Object.freeze({
    fit: 'contain',
    quality: 0.88,
    variants: Object.freeze({
      master: { width: 1000, height: 1000 },
      thumb: { width: 240, height: 240 },
    }),
  }),
});

export function validateSourceImage(file) {
  if (!file) {
    throw new Error('Choose an image first.');
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Use a JPG, PNG, or WebP image.');
  }

  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('The source image must be 12 MB or smaller.');
  }
}

async function decodeImage(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, {
        imageOrientation: 'from-image',
      });
    } catch {
      return createImageBitmap(file);
    }
  }

  const url = URL.createObjectURL(file);

  try {
    return await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Could not decode that image.'));
      element.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sourceDimensions(image) {
  return {
    width: image.naturalWidth || image.width || 0,
    height: image.naturalHeight || image.height || 0,
  };
}

function coverSourceRect(
  sourceWidth,
  sourceHeight,
  targetWidth,
  targetHeight,
  focusX,
  focusY,
) {
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = sourceWidth / sourceHeight;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceRatio > targetRatio) {
    cropWidth = sourceHeight * targetRatio;
  } else if (sourceRatio < targetRatio) {
    cropHeight = sourceWidth / targetRatio;
  }

  const maxX = sourceWidth - cropWidth;
  const maxY = sourceHeight - cropHeight;
  const x = Math.min(
    maxX,
    Math.max(0, sourceWidth * focusX - cropWidth / 2),
  );
  const y = Math.min(
    maxY,
    Math.max(0, sourceHeight * focusY - cropHeight / 2),
  );

  return { x, y, width: cropWidth, height: cropHeight };
}

function boundedCoverDimensions(sourceRect, targetWidth, targetHeight) {
  const scale = Math.min(
    1,
    sourceRect.width / targetWidth,
    sourceRect.height / targetHeight,
  );

  if (scale >= 1) {
    return { width: targetWidth, height: targetHeight };
  }

  return {
    width: Math.max(1, Math.floor(targetWidth * scale)),
    height: Math.max(1, Math.floor(targetHeight * scale)),
  };
}

function drawContain(
  context,
  image,
  sourceWidth,
  sourceHeight,
  targetWidth,
  targetHeight,
) {
  const scale = Math.min(
    1,
    targetWidth / sourceWidth,
    targetHeight / sourceHeight,
  );
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (targetWidth - width) / 2;
  const y = (targetHeight - height) / 2;

  context.clearRect(0, 0, targetWidth, targetHeight);
  context.drawImage(
    image,
    0,
    0,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

function canvasToWebp(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              'This browser could not create the optimized WebP image.',
            ),
          );
          return;
        }

        resolve(blob);
      },
      'image/webp',
      quality,
    );
  });
}

async function renderVariant({
  image,
  sourceWidth,
  sourceHeight,
  width,
  height,
  fit,
  focusX,
  focusY,
  quality,
}) {
  let outputWidth = width;
  let outputHeight = height;
  let sourceRect = null;

  if (fit === 'cover') {
    sourceRect = coverSourceRect(
      sourceWidth,
      sourceHeight,
      width,
      height,
      focusX,
      focusY,
    );
    const bounded = boundedCoverDimensions(sourceRect, width, height);
    outputWidth = bounded.width;
    outputHeight = bounded.height;
  }

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext('2d', { alpha: true });

  if (!context) {
    throw new Error('Image processing is not available in this browser.');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  if (fit === 'contain') {
    drawContain(
      context,
      image,
      sourceWidth,
      sourceHeight,
      outputWidth,
      outputHeight,
    );
  } else {
    context.drawImage(
      image,
      sourceRect.x,
      sourceRect.y,
      sourceRect.width,
      sourceRect.height,
      0,
      0,
      outputWidth,
      outputHeight,
    );
  }

  const blob = await canvasToWebp(canvas, quality);

  return {
    blob,
    width: outputWidth,
    height: outputHeight,
    bytes: blob.size,
    contentType: 'image/webp',
  };
}

export async function prepareImageVariants(
  file,
  presetName,
  { focusX = 0.5, focusY = 0.38 } = {},
) {
  validateSourceImage(file);

  const preset = IMAGE_PRESETS[presetName];

  if (!preset) {
    throw new Error('Unknown Bastly image preset.');
  }

  const image = await decodeImage(file);
  const { width: sourceWidth, height: sourceHeight } = sourceDimensions(image);

  try {
    if (!sourceWidth || !sourceHeight) {
      throw new Error('Could not read the image dimensions.');
    }

    if (sourceWidth * sourceHeight > MAX_SOURCE_PIXELS) {
      throw new Error(
        'The image is too large to process safely. Use an image under 60 megapixels.',
      );
    }

    const variants = {};

    for (const [variant, dimensions] of Object.entries(preset.variants)) {
      variants[variant] = await renderVariant({
        image,
        sourceWidth,
        sourceHeight,
        width: dimensions.width,
        height: dimensions.height,
        fit: preset.fit,
        focusX,
        focusY,
        quality:
          variant === 'master'
            ? Math.min(0.88, preset.quality + 0.02)
            : preset.quality,
      });
    }

    return {
      source: {
        width: sourceWidth,
        height: sourceHeight,
        bytes: file.size,
        contentType: file.type,
      },
      variants,
    };
  } finally {
    if (typeof image.close === 'function') {
      image.close();
    }
  }
}

export function totalVariantBytes(prepared) {
  return Object.values(prepared?.variants || {}).reduce(
    (sum, variant) => sum + variant.bytes,
    0,
  );
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
