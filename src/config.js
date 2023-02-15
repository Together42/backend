import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

function required(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;
  if (value == null) {
    throw new Error(`Key ${key} is undefined`);
  }
  return value;
}

export const config = {
  jwt: {
    secretKey: required("JWT_SECRET"),
    expiresInSec: parseInt(required("JWT_EXPIRES_SEC", 86400)),
  },
  bcrypt: {
    saltRounds: parseInt(required("BCRYPT_SALT_ROUNDS", 10)),
  },
  host: {
    port: parseInt(required("HOST_PORT", 8080)),
  },
  db: {
    host: required("DB_HOST"),
    user: required("DB_USER"),
    database: required("DB_DATABASE"),
    password: required("DB_PASSWORD"),
  },
  hostname: {
    hostname: required("HOSTNAME", "local"),
  },
  serverUrl: {
    serverUrl: required("SERVER_URL", "http://localhost:8080/"),
  },
  s3: {
    access_key_id: required("ACCESS_KEY_ID"),
    secret_access_key: required("SECRET_ACCESS_KEY"),
    region: required("REGION"),
  },
  slack: {
    jip: required("SLACK_JIP"),
    tkim: required("SLACK_TKIM"),
    ywee: required("SLACK_YWEE"),
    slack_token: required("BOT_USER_OAUTH_ACCESS_TOKEN"),
  },
  rateLimit: {
    windowMs: 60 * 1000, //1분
    maxRequest: 100, //ip 1개당 100번
  },
  smtp: {
    service: required("SMTP_SERVICE"),
    host: required("SMTP_HOST"),
    port: required("SMTP_PORT"),
    id: required("SMTP_ID"),
    pw: required("SMTP_PW"),
  }
};

export const smtpTransport = nodemailer.createTransport({
  // service: "Naver",
  // host: "smtp.naver.com",
  // port: 587,
  service: config.smtp.service,
  host: config.smtp.host,
  port: config.smtp.port,
  auth: {
    user: config.smtp.id,
    pass: config.smtp.pw,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
