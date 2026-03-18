'use strict';

/**
 * Factory middleware — pass an array of roles that are allowed to access the route.
 *
 * Usage:
 *   router.patch('/claims/:id/status', auth, roleCheck(['adjuster']), handler)
 *   router.get('/claims',              auth, roleCheck(['policyholder', 'adjuster']), handler)
 */
function roleCheck(allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      // auth middleware must run first
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Unauthenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `Forbidden — requires one of: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
}

module.exports = roleCheck;
