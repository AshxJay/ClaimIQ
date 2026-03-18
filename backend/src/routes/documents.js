'use strict';

const { Router } = require('express');

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { generateUploadUrl, generateDownloadUrl } = require('../services/s3');
const db = require('../services/dynamodb');

const router = Router({ mergeParams: true }); // inherit :id from parent mount

// ── POST /claims/:id/upload-url ───────────────────────────────────────────────
// Role: policyholder
// Generate a pre-signed S3 PUT URL the frontend uses to upload a file directly.
// After uploading, the frontend should call PATCH /claims/:id to append the key.

router.post('/:id/upload-url', auth, roleCheck(['policyholder']), async (req, res) => {
  const { filename } = req.body;

  if (!filename || filename.trim().length === 0) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'filename is required in the request body',
    });
  }

  // Sanitise the filename — strip path separators to prevent key injection
  const safeFilename = filename.replace(/[/\\]/g, '_').trim();

  try {
    // Verify the claim exists and belongs to this policyholder
    const claim = await db.getClaimById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false, data: null, message: 'Claim not found' });
    }

    if (claim.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Forbidden — you do not own this claim',
      });
    }

    const { uploadUrl, key } = await generateUploadUrl(req.params.id, safeFilename);

    return res.status(200).json({
      success: true,
      data: { uploadUrl, key, expiresInSeconds: 900 },
      message: 'Pre-signed upload URL generated. PUT your file to uploadUrl.',
    });
  } catch (err) {
    console.error('[documents] POST /:id/upload-url error:', err);
    return res.status(500).json({ success: false, data: null, message: err.message });
  }
});

// ── GET /claims/:id/download-url ──────────────────────────────────────────────
// Role: both
// Return a pre-signed GET URL for a specific document key belonging to this claim.

router.get('/:id/download-url', auth, roleCheck(['policyholder', 'adjuster']), async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'key query parameter is required',
    });
  }

  try {
    const claim = await db.getClaimById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false, data: null, message: 'Claim not found' });
    }

    // Policyholders must own the claim
    if (req.user.role === 'policyholder' && claim.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Forbidden — you do not own this claim',
      });
    }

    // Ensure the key is associated with this claim (prevent key fishing)
    if (!claim.documentKeys || !claim.documentKeys.includes(key)) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Document key not found on this claim',
      });
    }

    const downloadUrl = await generateDownloadUrl(key);

    return res.status(200).json({
      success: true,
      data: { downloadUrl, key, expiresInSeconds: 3600 },
      message: 'Pre-signed download URL generated',
    });
  } catch (err) {
    console.error('[documents] GET /:id/download-url error:', err);
    return res.status(500).json({ success: false, data: null, message: err.message });
  }
});

module.exports = router;
