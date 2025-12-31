import {auth as betterAuth} from "../lib/auth";
import { success } from "better-auth/*";
import { NextFunction, Request, Response } from "express";
import { User } from "../../generated/prisma/client";
export enum userRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

const auth = (...roles: userRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await betterAuth.api.getSession({
      headers: req.headers as any,
    });
    console.log(session);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized",
      });
    }
    if (!session.user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email",
      });
    }
    if (roles.length && !roles.includes(session.user.role as userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access",
      });
    }
    req.user = session.user as User;

    next();
  };
};

export default auth;