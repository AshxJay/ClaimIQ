'use strict';

const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// ── Client setup ──────────────────────────────────────────────────────────────

const s3 = new S3Client({ region: process.env.AWS_REGION });

const BUCKET = process.env.S3_BUCKET_NAME;
const UPLOAD_EXPIRY_SECONDS = 15 * 60;  // 15 minutes
const DOWNLOAD_EXPIRY_SECONDS = 60 * 60; // 1 hour

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generate a pre-signed PUT URL so the frontend can upload directly to S3.
 * Object key format: claims/{claimId}/{filename}
 *
 * @param {string} claimId
 * @param {string} filename  — original file name (e.g. "receipt.pdf")
 * @returns {{ uploadUrl: string, key: string }}
 */
async function generateUploadUrl(claimId, filename) {
  if (!BUCKET) throw new Error('S3_BUCKET_NAME environment variable is not set');

  const key = `claims/${claimId}/${filename}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: UPLOAD_EXPIRY_SECONDS,
    });

    return { uploadUrl, key };
  } catch (err) {
    console.error('[s3] generateUploadUrl error:', err);
    throw new Error(`Failed to generate upload URL: ${err.message}`);
  }
}

/**
 * Generate a pre-signed GET URL for viewing a stored document.
 *
 * @param {string} key  — S3 object key (e.g. "claims/abc/receipt.pdf")
 * @returns {string}  downloadUrl
 */
async function generateDownloadUrl(key) {
  if (!BUCKET) throw new Error('S3_BUCKET_NAME environment variable is not set');

  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const downloadUrl = await getSignedUrl(s3, command, {
      expiresIn: DOWNLOAD_EXPIRY_SECONDS,
    });
    return downloadUrl;
  } catch (err) {
    console.error('[s3] generateDownloadUrl error:', err);
    throw new Error(`Failed to generate download URL: ${err.message}`);
  }
}

module.exports = { generateUploadUrl, generateDownloadUrl };
