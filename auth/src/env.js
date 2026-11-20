import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4001),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional().or(z.literal('')),
  JWT_SECRET: z.string().min(32).default('hostelolx-secure-jwt-secret-key-32-chars-long'),
  JWT_ISSUER: z.string().default('hostelolx-auth'),
  JWT_AUDIENCE: z.string().default('hostelolx-api'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment configuration:', result.error.flatten().fieldErrors);
  process.exit(1);
}

const env = result.data;

export default env;
