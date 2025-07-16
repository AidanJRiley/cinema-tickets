import dotenv from "dotenv";
dotenv.config();

export const config = {
  logLevel: process.env.LOG_LEVEL || "info",
  LOG_LEVELS: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4,
  },
};
