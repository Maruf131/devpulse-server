export const authorize = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    // role check
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden Access",
      });
    }

    next();
  };
};
