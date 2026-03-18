'use strict';

const { CognitoJwtVerifier } = require('aws-jwt-verify');

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: 'access',
  clientId: process.env.COGNITO_CLIENT_ID,
});

async function auth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'No authorization token provided',
    });
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifier.verify(token);

    const userId = payload.sub;
    const email = payload.email || payload.username || '';

    const groups = Array.isArray(payload['cognito:groups'])
      ? payload['cognito:groups']
      : [];

    let role = 'policyholder';
    if (groups.includes('adjuster')) {
      role = 'adjuster';
    } else if (groups.includes('policyholder')) {
      role = 'policyholder';
    }

    req.user = { userId, email, role, groups };
    next();
  } catch (err) {
    console.error('[auth] Token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid or expired authorization token',
    });
  }
}

module.exports = auth;