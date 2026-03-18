'use strict';

const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const db = require('../services/dynamodb');
const { sendStatusUpdateEmail } = require('../services/ses');

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_STATUSES = ['submitted', 'under_review', 'approved', 'rejected'];
const VALID_CLAIM_TYPES = ['health', 'auto', 'home', 'life', 'travel', 'other'];

function ok(res, data, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

function fail(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, data: null, message });
}

// ── POST /claims ─────────────────────────────────────────────────────────────
// Role: policyholder
// Submit a new insurance claim

router.post('/', auth, roleCheck(['policyholder']), async (req, res) => {
  const { claimType, description, documentKeys } = req.body;

  if (!claimType) return fail(res, 'claimType is required');
  if (!VALID_CLAIM_TYPES.includes(claimType)) {
    return fail(res, `claimType must be one of: ${VALID_CLAIM_TYPES.join(', ')}`);
  }
  if (!description || description.trim().length === 0) {
    return fail(res, 'description is required');
  }

  const now = new Date().toISOString();
  const claim = {
    claimId: uuidv4(),
    userId: req.user.userId,
    status: 'submitted',
    claimType,
    description: description.trim(),
    documentKeys: Array.isArray(documentKeys) ? documentKeys : [],
    adjusterNotes: '',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const created = await db.createClaim(claim);
    return ok(res, created, 'Claim submitted successfully', 201);
  } catch (err) {
    console.error('[claims] POST / error:', err);
    return fail(res, err.message, 500);
  }
});

// ── GET /claims ───────────────────────────────────────────────────────────────
// Role: both
// Policyholders get their own claims (userId GSI); adjusters see everything

router.get('/', auth, roleCheck(['policyholder', 'adjuster']), async (req, res) => {
  try {
    let claims;
    if (req.user.role === 'adjuster') {
      claims = await db.getAllClaims();
    } else {
      claims = await db.getClaimsByUserId(req.user.userId);
    }
    return ok(res, claims, `Fetched ${claims.length} claim(s)`);
  } catch (err) {
    console.error('[claims] GET / error:', err);
    return fail(res, err.message, 500);
  }
});

// ── GET /claims/:id ───────────────────────────────────────────────────────────
// Role: both
// Policyholders can only view their own claims; adjusters can view any

router.get('/:id', auth, roleCheck(['policyholder', 'adjuster']), async (req, res) => {
  try {
    const claim = await db.getClaimById(req.params.id);

    if (!claim) {
      return fail(res, 'Claim not found', 404);
    }

    // Policyholders must own the claim
    if (req.user.role === 'policyholder' && claim.userId !== req.user.userId) {
      return fail(res, 'Forbidden — you do not own this claim', 403);
    }

    return ok(res, claim);
  } catch (err) {
    console.error('[claims] GET /:id error:', err);
    return fail(res, err.message, 500);
  }
});

// ── PATCH /claims/:id/status ──────────────────────────────────────────────────
// Role: adjuster only
// Update claim status and optionally add adjuster notes, then send SES email

router.patch('/:id/status', auth, roleCheck(['adjuster']), async (req, res) => {
  const { status, adjusterNotes } = req.body;

  if (!status) return fail(res, 'status is required');
  if (!VALID_STATUSES.includes(status)) {
    return fail(res, `status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  try {
    // Verify the claim exists first
    const existing = await db.getClaimById(req.params.id);
    if (!existing) return fail(res, 'Claim not found', 404);

    const updates = { status };
    if (adjusterNotes !== undefined) updates.adjusterNotes = adjusterNotes;

    const updated = await db.updateClaim(req.params.id, updates);

    // Fire-and-forget SES notification — don't fail the request if email fails
    if (existing.email || req.body.notifyEmail) {
      const toEmail = existing.email || req.body.notifyEmail;
      sendStatusUpdateEmail({
        toEmail,
        claimId: req.params.id,
        newStatus: status,
        adjusterNotes,
      }).catch((e) => console.warn('[claims] SES notification failed (non-fatal):', e.message));
    }

    return ok(res, updated, 'Claim status updated');
  } catch (err) {
    console.error('[claims] PATCH /:id/status error:', err);
    return fail(res, err.message, 500);
  }
});

module.exports = router;
