# Bastly Cloudflare R2 media setup

Bastly uses Cloudflare R2 as the master media store for Admin-managed images.
The browser optimizes images first, then uploads only WebP variants directly to R2.
Render never receives the original image bytes.

## What Bastly stores

Doctor portrait:

```text
media/doctors/<doctor-id>/portrait/<upload-id>/master.webp
media/doctors/<doctor-id>/portrait/<upload-id>/profile.webp
media/doctors/<doctor-id>/portrait/<upload-id>/card.webp
media/doctors/<doctor-id>/portrait/<upload-id>/thumb.webp
```

Reward image:

```text
media/rewards/<reward-id>/rewardImage/<upload-id>/master.webp
media/rewards/<reward-id>/rewardImage/<upload-id>/card.webp
media/rewards/<reward-id>/rewardImage/<upload-id>/thumb.webp
```

Partner logo:

```text
media/partners/<reward-id>/partnerLogo/<upload-id>/master.webp
media/partners/<reward-id>/partnerLogo/<upload-id>/thumb.webp
```

Old uploaded objects are deleted on a best-effort basis after a replacement is committed.

## Browser optimization presets

### Doctor portrait

```text
master   1600 x 2000 WebP
profile   900 x 1125 WebP
card      600 x 750  WebP
thumb     240 x 240  WebP
```

### Reward image

```text
master   1600 x 1000 WebP
card      960 x 600  WebP
thumb     320 x 200  WebP
```

### Partner logo

```text
master   1000 x 1000 WebP
thumb     240 x 240  WebP
```

PNG transparency is preserved for partner logos.
Re-encoding through canvas strips normal source EXIF/GPS metadata from the uploaded variants.

## Required server environment variables

```text
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=bastly-media
CLOUDFLARE_R2_PUBLIC_BASE_URL=
```

Do not create any `VITE_` versions of the access key or secret key.
They must remain server-only.

The public base URL can temporarily be an R2 `r2.dev` URL while testing.
Do not use `r2.dev` as Bastly's production media origin; Cloudflare treats it as a
non-production, rate-limited development endpoint.

The production media origin depends on the owner's final domain decision:

- If the owner uses a custom domain, connect a media subdomain directly to the R2 bucket,
  for example:

  ```text
  https://media.your-bastly-domain.com
  ```

- If the owner does not use a custom domain, do not fall back to `r2.dev` for production.
  At the final deployment stage, expose public R2 objects through a Cloudflare Worker with
  an R2 binding on the selected stable Cloudflare production origin, then use that HTTPS
  origin as `CLOUDFLARE_R2_PUBLIC_BASE_URL`.

Until that decision is made, keep the production public media origin unresolved rather than
inventing a deployment URL.

## R2 API credentials

Create R2 S3-compatible credentials scoped to the Bastly media bucket with only the object
permissions needed to upload, inspect, and delete Bastly media.

The server uses the Cloudflare S3 endpoint:

```text
https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

The credentials are used only to create short-lived signed upload URLs and to verify/delete
objects. They are never sent to React.

## Required bucket CORS

Direct browser uploads need an R2 CORS policy.

For local development plus the final production origin, use the shape below and replace the
production origin once the domain is known:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://www.your-bastly-domain.com"
    ],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": [
      "Content-Type",
      "Cache-Control"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Do not use `*` for production AllowedOrigins.

## Upload security flow

```text
Admin chooses JPG / PNG / WebP
        ↓
Browser validates source type / size
        ↓
Browser decodes + crops/resizes + re-encodes WebP variants
        ↓
POST /api/admin/media/uploads
        ↓
Server checks Admin role + target entity + exact Bastly preset
        ↓
Server creates a short-lived MediaUploadSession
        ↓
Server signs one PUT URL for each exact R2 object key
        ↓
Browser PUTs WebP blobs directly to R2
        ↓
POST /api/admin/media/uploads/commit
        ↓
Server HEAD-checks every object (exists, WebP, size limit)
        ↓
Mongo stores only R2 object metadata/keys
        ↓
Old variant set is deleted best-effort after replacement
```

The presigned URLs expire after about five minutes. The Mongo upload session expires after
about fifteen minutes.

## Development before the owner gives credentials

The website continues working without R2 values.

`GET /api/admin/media/config` returns `enabled: false`, and Admin media controls explain that
Cloudflare storage is not configured. The existing bundled Doctor portrait paths remain usable.

Once all five R2 ENV values are added and the server is restarted, the same UI becomes active.
No client rebuild is required just to enable the upload endpoints locally.

## First real test

After R2 is configured:

1. Open Admin > Doctors.
2. Edit a Doctor.
3. Choose a large JPG/PNG/WebP portrait.
4. Adjust Crop focus if needed.
5. Confirm the UI shows WebP variant sizes.
6. Upload.
7. Refresh `/doctors` and the Doctor profile.
8. Verify the public image is loaded from the configured R2 public domain.
9. Replace the portrait and verify the new version appears.
10. Remove it and verify the legacy/static fallback is also cleared by the remove action.

Then repeat under Admin > Bastly Cards > Media for a partner logo and reward image.

## Credential verification command

After the owner adds the five R2 values to a local/server environment, run:

```text
npm run check:r2 --prefix server
```

This sends a read-only bucket availability check and does not print the access key or secret.
