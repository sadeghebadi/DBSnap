import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load .env from root if it exists
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") }); // Also check current dir

const configSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_NAME: z.string().default("DBSnap"),
  API_PORT: z
    .string()
    .default("3000")
    .transform((v) => parseInt(v, 10)),
  API_URL: z.string().url().default("http://localhost:4000"),
  WORKER_PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .default(4001),
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().default("development_secret_key_change_me_in_production"),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  ENCRYPTION_KEY: z
    .string()
    .length(32)
    .default("v6y2_8_B7&p?R#Lx*G@K5e!Np$W2mZq9"), // 32 characters for AES-256
});

export type Config = z.infer<typeof configSchema>;

let _config: Config | null = null;

export const getConfig = (): Config => {
  if (_config) return _config;

  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment configuration:");
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  _config = result.data;
  return _config;
};
