export const authorize = (...roles) => {
    return (req, res, next) => {
        // Check the role
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden Access",
            });
        }
        next();
    };
};
//# sourceMappingURL=authorize.js.map