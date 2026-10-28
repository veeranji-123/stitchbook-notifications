require('dotenv').config();

const REQUIRED_ENV = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'INTERNAL_TOKEN'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  missing.forEach((key) => console.error(`[fatal] Missing required environment variable: ${key}`));
  process.exit(1);
}

module.exports = {
  port: parseInt(process.env.PORT || '3003', 10),
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  internalToken: process.env.INTERNAL_TOKEN,
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};
