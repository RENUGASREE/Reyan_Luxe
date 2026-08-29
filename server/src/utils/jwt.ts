import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserRole } from "../types/index.js";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): { sub: string } {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; type?: string };
  if (payload.type !== "refresh") {
    throw new Error("Invalid refresh token type");
  }
  return { sub: payload.sub };
}
