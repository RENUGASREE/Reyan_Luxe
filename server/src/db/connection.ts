import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.isDevelopment,
  });

  console.log(`MongoDB connected (${env.isProduction ? "production" : "development"})`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
