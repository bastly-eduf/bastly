import crypto from 'node:crypto';

// Run locally and paste the result directly into the hosting provider if a
// platform-generated secret is not being used. Never commit the output.
console.log(crypto.randomBytes(48).toString('base64url'));
