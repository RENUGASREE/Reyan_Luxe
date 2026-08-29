import { Request, Response } from "express";
import mongoose from "mongoose";

export function healthCheck(_req: Request, res: Response): void {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? "connected" : "disconnected";

  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
    },
  });
}
