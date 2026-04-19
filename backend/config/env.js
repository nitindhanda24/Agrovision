const isProduction = process.env.NODE_ENV === "production";

function getRequiredEnv(name, fallback) {
  const value = process.env[name];

  if (value && String(value).trim()) {
    return String(value).trim();
  }

  if (!isProduction && fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

module.exports = {
  isProduction,
  getRequiredEnv
};
