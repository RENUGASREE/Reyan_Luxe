import { createApp } from "./app.js";
import { connectDatabase } from "./db/connection.js";
import { env } from "./config/env.js";

async function bootstrap() {
  await connectDatabase();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Reyan Luxe API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
