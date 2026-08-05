// middleware/roleMiddleware.js
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("🔍 Role Middleware - req.user.role =", req.user?.role);

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Role not found in token"
      });
    }

    const userRole = req.user.role.toString().toLowerCase().trim();
    const allowed = allowedRoles.map(r => r.toLowerCase().trim());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required: ${allowedRoles.join(" or ")}`
      });
    }

    next();
  };
};

module.exports = authorizeRoles;   // ← Fixed with space