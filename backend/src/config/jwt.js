import jwt from "jsonwebtoken";

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "24h";
export const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";

function assertSecret(secret, name) {
  if (!secret) {
    throw new Error(`${name} is required`);
  }
}

export function signAccessToken(payload) {
  assertSecret(JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET");
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES });
}

export function signRefreshToken(payload) {
  assertSecret(JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET");
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES });
}

export function verifyAccessToken(token) {
  assertSecret(JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET");
  return jwt.verify(token, JWT_ACCESS_SECRET);
}

