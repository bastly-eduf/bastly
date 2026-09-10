import {
  ImagePlus,
  RefreshCw,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  api,
  apiErrorMessage,
} from '../../services/api';
import {
  formatBytes,
  prepareImageVariants,
  totalVariantBytes,
  validateSourceImage,
} from '../../utils/imageProcessing';

const PRESET_BY_SLOT = {
  portrait: 'portrait',
  rewardImage: 'reward',
  partnerLogo: 'logo',
};

export default function MediaImageUploader({
  mediaConfig,
  entityType,
  entityId,
  slot,
  label,
  description,
  currentUrl = '',
  onChanged,
}) {
  const inputRef = useRef(null);
  const prepareRequestRef = useRef(0);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] =
    useState('');
  const [prepared, setPrepared] =
    useState(null);
  const [focusY, setFocusY] = useState(
    slot === 'portrait' ? 35 : 50,
  );
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const preset = PRESET_BY_SLOT[slot];
  const isLogo = slot === 'partnerLogo';
  const isPortrait = slot === 'portrait';
  const enabled = Boolean(mediaConfig?.enabled);

  const previewAspect = useMemo(() => {
    if (isPortrait) return 'aspect-[4/5]';
    if (isLogo) return 'aspect-square';
    return 'aspect-[8/5]';
  }, [isLogo, isPortrait]);

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

  const resetSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);
    setPreviewUrl('');
    setPrepared(null);
    setError('');

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const prepare = async (
    selectedFile,
    nextFocusY = focusY,
  ) => {
    validateSourceImage(selectedFile);
    const requestId = ++prepareRequestRef.current;
    setBusy('prepare');
    setError('');

    try {
      const result = await prepareImageVariants(
        selectedFile,
        preset,
        {
          focusX: 0.5,
          focusY: nextFocusY / 100,
        },
      );

      if (requestId === prepareRequestRef.current) {
        setPrepared(result);
      }
    } catch (err) {
      if (requestId === prepareRequestRef.current) {
        setPrepared(null);
        setError(
          err?.message ||
            'Could not optimize that image.',
        );
      }
    } finally {
      if (requestId === prepareRequestRef.current) {
        setBusy('');
      }
    }
  };

  const chooseFile = async (event) => {
    const selectedFile =
      event.target.files?.[0] || null;

    if (!selectedFile) return;

    try {
      validateSourceImage(selectedFile);
    } catch (err) {
      setError(err.message);
      event.target.value = '';
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    setPreviewUrl(
      URL.createObjectURL(selectedFile),
    );
    await prepare(selectedFile);
  };

  const updateFocus = async (value) => {
    const next = Number(value);
    setFocusY(next);

    if (file) {
      await prepare(file, next);
    }
  };

  const upload = async () => {
    if (!prepared || !entityId || !enabled) {
      return;
    }

    setBusy('upload');
    setError('');

    try {
      const files = Object.entries(
        prepared.variants,
      ).map(([variant, value]) => ({
        variant,
        width: value.width,
        height: value.height,
        bytes: value.bytes,
        contentType: value.contentType,
      }));

      const { data: uploadSession } =
        await api.post('/admin/media/uploads', {
          entityType,
          entityId,
          slot,
          files,
        });

      for (const target of uploadSession.uploads) {
        const variant =
          prepared.variants[target.variant];

        if (!variant) {
          throw new Error(
            `Missing prepared ${target.variant} variant.`,
          );
        }

        const response = await fetch(target.url, {
          method: 'PUT',
          headers: target.headers,
          body: variant.blob,
        });

        if (!response.ok) {
          throw new Error(
            `Cloudflare rejected the ${target.variant} upload (${response.status}). Check the R2 bucket CORS policy and try again.`,
          );
        }
      }

      await api.post(
        '/admin/media/uploads/commit',
        {
          uploadId: uploadSession.uploadId,
        },
      );

      resetSelection();
      await onChanged?.();
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          err?.message ||
            'Could not upload this image.',
        ),
      );
    } finally {
      setBusy('');
    }
  };

  const remove = async () => {
    if (!currentUrl || !entityId) return;

    const confirmed = window.confirm(
      `Remove this ${label.toLowerCase()} from Bastly?`,
    );

    if (!confirmed) return;

    setBusy('remove');
    setError('');

    try {
      await api.delete(
        `/admin/media/${entityType}/${entityId}/${slot}`,
      );
      resetSelection();
      await onChanged?.();
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          'Could not remove this image.',
        ),
      );
    } finally {
      setBusy('');
    }
  };

  return (
    <section className="rounded-[22px] border border-line bg-surface p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-sm font-extrabold text-bastly-navy">
            {label}
          </p>
          <p className="mb-0 text-xs leading-5 text-muted">
            {description}
          </p>
        </div>

        <span
          className={[
            'shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] font-extrabold',
            enabled
              ? 'bg-[#eef8f1] text-[#18764a]'
              : 'bg-[#fff6df] text-[#9a6510]',
          ].join(' ')}
        >
          {enabled ? 'R2 ready' : 'R2 not configured'}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
        <div
          className={[
            'relative overflow-hidden rounded-2xl border border-line bg-white',
            previewAspect,
          ].join(' ')}
        >
          {previewUrl || currentUrl ? (
            <img
              src={previewUrl || currentUrl}
              alt=""
              className={[
                'size-full',
                isLogo
                  ? 'object-contain p-3'
                  : 'object-cover',
              ].join(' ')}
              style={
                previewUrl && !isLogo
                  ? {
                      objectPosition: `50% ${focusY}%`,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="grid size-full place-items-center text-bastly-blue/45">
              <ImagePlus size={26} />
            </div>
          )}
        </div>

        <div className="min-w-0">
          {!enabled && (
            <p className="mb-3 rounded-2xl bg-white px-3 py-2.5 text-[0.68rem] leading-5 text-muted">
              The uploader is already wired, but it stays disabled until the owner adds the Cloudflare R2 server ENV values. Existing static images keep working.
            </p>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={chooseFile}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!enabled || busy !== ''}
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-xs font-extrabold text-bastly-navy disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ImagePlus size={15} />
              {currentUrl ? 'Replace image' : 'Choose image'}
            </button>

            {file && (
              <button
                type="button"
                disabled={busy !== ''}
                onClick={resetSelection}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-xs font-extrabold text-muted disabled:opacity-50"
              >
                <RefreshCw size={14} />
                Clear selection
              </button>
            )}

            {currentUrl && (
              <button
                type="button"
                disabled={busy !== ''}
                onClick={remove}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d1605a]/20 bg-[#fff0ef] px-3.5 text-xs font-extrabold text-[#a83d36] disabled:opacity-50"
              >
                <Trash2 size={14} />
                {busy === 'remove'
                  ? 'Removing…'
                  : 'Remove'}
              </button>
            )}
          </div>

          {file && (
            <div className="mt-3 rounded-2xl bg-white p-3 text-[0.68rem] leading-5 text-muted">
              <p className="mb-1 truncate font-bold text-bastly-navy">
                {file.name}
              </p>
              <p className="mb-0">
                Source {formatBytes(file.size)}
                {prepared
                  ? ` → ${formatBytes(
                      totalVariantBytes(prepared),
                    )} total across optimized WebP variants`
                  : ''}
              </p>
            </div>
          )}

          {file && !isLogo && (
            <label className="mt-3 grid gap-2">
              <span className="flex items-center justify-between text-[0.68rem] font-bold text-muted">
                <span>Crop focus</span>
                <span>{focusY}% from top</span>
              </span>
              <input
                type="range"
                min="20"
                max="80"
                step="1"
                value={focusY}
                disabled={busy !== ''}
                onChange={(event) =>
                  updateFocus(event.target.value)
                }
                className="accent-[#237fd1]"
              />
              <span className="text-[0.64rem] leading-5 text-muted">
                Move the focus if the face/product sits higher or lower in the source image.
              </span>
            </label>
          )}

          {prepared && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.entries(
                prepared.variants,
              ).map(([variant, value]) => (
                <span
                  key={variant}
                  className="rounded-full bg-bastly-blue-pale px-2.5 py-1 text-[0.62rem] font-extrabold text-bastly-blue-dark"
                >
                  {variant} {value.width}×{value.height} ·{' '}
                  {formatBytes(value.bytes)}
                </span>
              ))}
            </div>
          )}

          {error && (
            <p className="mt-3 mb-0 rounded-2xl bg-[#fff0ef] px-3 py-2.5 text-xs font-bold leading-5 text-[#a83d36]">
              {error}
            </p>
          )}

          {prepared && enabled && (
            <button
              type="button"
              disabled={busy !== ''}
              onClick={upload}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-bastly-blue px-4 text-xs font-extrabold text-white disabled:opacity-50"
            >
              <UploadCloud size={15} />
              {busy === 'upload'
                ? 'Uploading to R2…'
                : busy === 'prepare'
                  ? 'Optimizing…'
                  : 'Upload optimized WebP'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
