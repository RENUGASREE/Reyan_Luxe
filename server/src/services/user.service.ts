import { Types } from "mongoose";
import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { sanitizeUser } from "./auth.service.js";
import { paginate } from "../utils/helpers.js";
import type { PaginationMeta } from "../types/index.js";

export async function updateProfile(
  userId: string,
  input: { username?: string; firstName?: string; lastName?: string; phone?: string }
) {
  const user = await User.findByIdAndUpdate(userId, input, { new: true, runValidators: true });
  if (!user) throw new AppError("User not found", 404);
  return sanitizeUser(user);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user || !user.passwordHash) {
    throw new AppError("Password login not available for this account", 400);
  }

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw new AppError("Current password is incorrect", 400);

  user.passwordHash = await hashPassword(newPassword);
  user.refreshTokenHash = undefined;
  await user.save();
}

export async function listUsers(query: {
  page: number;
  limit: number;
  q?: string;
  role?: "customer" | "admin";
}) {
  const { page, limit, skip } = paginate(query.page, query.limit);
  const filter: Record<string, unknown> = {};

  if (query.role) filter.role = query.role;
  if (query.q) {
    filter.$or = [
      { email: { $regex: query.q, $options: "i" } },
      { username: { $regex: query.q, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };

  return {
    items: users.map((u) => ({
      id: String(u._id),
      email: u.email,
      username: u.username,
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      isEmailVerified: u.isEmailVerified,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    })),
    meta,
  };
}

export async function updateUserRole(userId: string, role: "customer" | "admin") {
  if (!Types.ObjectId.isValid(userId)) throw new AppError("Invalid user id", 400);
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user) throw new AppError("User not found", 404);
  return sanitizeUser(user);
}
