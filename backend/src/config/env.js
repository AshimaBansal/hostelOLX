import 'dotenv/config';

const env = {
  port: Number(process.env.PORT) || 4001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

env.isProduction = env.nodeEnv === 'production';
env.isTest = env.nodeEnv === 'test';

export default env;
