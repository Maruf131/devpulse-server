import jwt from "jsonwebtoken";
import config from "../../config";
import type { Request } from "express";

export const verifyToken = (req: any, res: any, next: any) => {
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
    const decoded = jwt.verify(token, config.secret_key as string);

    // save user in req
    req.user = decoded;

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
