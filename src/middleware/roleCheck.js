// Runs AFTER auth.js. Restricts a route to specific roles.
// Usage: router.post('/listings', authMiddleware, roleCheck(['landlord']), createListing)

const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

export default roleCheck;