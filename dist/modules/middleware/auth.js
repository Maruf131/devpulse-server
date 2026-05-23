import jwt from "jsonwebtoken";
import config from "../../config";
export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        // token check
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token found",
            });
        }
        // verify token
        const decoded = jwt.verify(token, config.secret_key);
        // save user in req
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};
//# sourceMappingURL=auth.js.map