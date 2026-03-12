import jwt from 'jsonwebtoken';

export function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied: insufficient permissions',
                requiredRoles: roles,
                userRole: req.user.role 
                });
        }
        next();
    };
}

export const requireAdmin = authorizeRoles('admin');