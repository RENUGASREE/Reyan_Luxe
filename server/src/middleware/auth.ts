import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./errorHandler.js";
import { UserRole } from "../types/index.js";

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  if (header.startsWith("Bearer ")) return header.slice(7);
  if (header.startsWith("Token ")) return header.slice(6);
  return null;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    next(new AppError("Authentication required", 401));
    return;
  }
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      sub: string;
      email: string;
      role: UserRole;
    };

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    next(new AppError("Invalid or expired access token", 401));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError("Authentication required", 401));
    return;
  }

  if (req.user.role !== "admin") {
    next(new AppError("Admin access required", 403));
    return;
  }

  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    next();
    return;
  }
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      sub: string;
      email: string;
      role: UserRole;
    };
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}
