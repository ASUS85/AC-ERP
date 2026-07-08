import jwt from "jsonwebtoken";

const PUBLIC_LINK_SECRET = process.env.PUBLIC_LINK_SECRET || process.env.JWT_ACCESS_SECRET;
const PUBLIC_LINK_EXPIRES = process.env.PUBLIC_LINK_EXPIRES || "14d";

function assertSecret() {
  if (!PUBLIC_LINK_SECRET) {
    throw new Error("PUBLIC_LINK_SECRET or JWT_ACCESS_SECRET is required");
  }
}

export function signBcfSupplierToken(idBcf, action) {
  assertSecret();
  return jwt.sign({ scope: "bcf_supplier", idBcf, action }, PUBLIC_LINK_SECRET, { expiresIn: PUBLIC_LINK_EXPIRES });
}

export function verifyBcfSupplierToken(token, expectedAction) {
  assertSecret();
  const payload = jwt.verify(token, PUBLIC_LINK_SECRET);
  if (payload.scope !== "bcf_supplier" || payload.action !== expectedAction || !payload.idBcf) {
    throw new Error("Invalid public link token");
  }
  return payload;
}

export function publicApiBaseUrl() {
  const explicitUrl = process.env.PUBLIC_API_URL || process.env.BACKEND_PUBLIC_URL || process.env.API_PUBLIC_URL;
  if (explicitUrl) return explicitUrl.replace(/\/$/, "");
  return `http://localhost:${process.env.PORT || 3000}/api/v1`;
}
