"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
var zod_1 = require("zod");
var dotenv_1 = __importDefault(require("dotenv"));
var path_1 = __importDefault(require("path"));
// Load .env from root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
var envSchema = zod_1.z.object({
    // Database
    DATABASE_URL: zod_1.z.string().url(),
    // Redis
    REDIS_HOST: zod_1.z.string().default('localhost'),
    REDIS_PORT: zod_1.z.string().transform(Number).default('6379'),
    // S3
    S3_ENDPOINT: zod_1.z.string().url(),
    S3_REGION: zod_1.z.string().default('us-east-1'),
    S3_ACCESS_KEY: zod_1.z.string().min(1),
    S3_SECRET_KEY: zod_1.z.string().min(1),
    S3_BUCKET: zod_1.z.string().min(1),
    // Security
    JWT_SECRET: zod_1.z.string().min(10),
    MASTER_KEY: zod_1.z.string().length(32, "MASTER_KEY must be exactly 32 bytes/characters"),
    // App
    PORT: zod_1.z.string().transform(Number).default('3000'),
    API_URL: zod_1.z.string().url(),
    WEB_URL: zod_1.z.string().url(),
    // Node Environment
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
});
var parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}
exports.env = parsed.data;
