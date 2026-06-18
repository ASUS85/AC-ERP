import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import dayjs from "dayjs";
import { ApiError } from "../../utils/response.util.js";
import { BCRYPT_ROUNDS } from "../../config/constants.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../services/jwt.service.js";
import { sendMfaCodeEmail } from "../../services/email.service.js";
import { authRepository } from "./auth.repository.js";

const mfaChallenges = new Map();
const MFA_CODE_TTL_MS = 10 * 60 * 1000;
const MFA_RESEND_DELAY_MS = 30 * 1000;

function permissionsFromUser(user) {
  return user.role?.permissions?.map(({ permission }) => `${permission.module}:${permission.action}`) || [];
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return {
    ...safe,
    permissions: permissionsFromUser(user),
    role: user.role ? { id: user.role.id, nomRole: user.role.nomRole } : null,
  };
}

function refreshExpiry() {
  return dayjs().add(7, "day").toDate();
}

function generateMfaCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

async function createMfaChallenge(user) {
  const code = generateMfaCode();
  const mfaToken = crypto.randomUUID();
  const now = Date.now();

  mfaChallenges.set(mfaToken, {
    userId: user.id,
    codeHash: hashCode(code),
    expiresAt: now + MFA_CODE_TTL_MS,
    resendAfter: now + MFA_RESEND_DELAY_MS,
    attempts: 0,
  });

  await sendMfaCodeEmail(user.email, user.prenom || user.nom || "Utilisateur", code);

  return {
    mfaRequired: true,
    method: "email",
    mfaToken,
    email: maskEmail(user.email),
    expiresIn: 600,
    resendAfter: 30,
  };
}

async function issueSession(user) {
  const payload = { userId: user.id, roleId: user.idRole, permissions: permissionsFromUser(user) };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: user.id });
  await authRepository.createRefreshToken({
    token: refreshToken,
    idUtilisateur: user.id,
    expiresAt: refreshExpiry(),
  });

  return { user: publicUser(user), accessToken, refreshToken };
}

export const authService = {
  async login({ email, password }) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new ApiError(401, "INVALID_CREDENTIALS", "Email ou mot de passe invalide");
    if (user.statut !== "ACTIF") throw new ApiError(403, "ACCOUNT_DISABLED", "Compte inactif ou bloque");
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ApiError(423, "ACCOUNT_LOCKED", "Compte temporairement verrouille");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const failedAttempts = user.failedAttempts + 1;
      await authRepository.updateUser(user.id, {
        failedAttempts,
        lockedUntil: failedAttempts >= 5 ? dayjs().add(15, "minute").toDate() : null,
      });
      throw new ApiError(401, "INVALID_CREDENTIALS", "Email ou mot de passe invalide");
    }

    await authRepository.updateUser(user.id, { failedAttempts: 0, lockedUntil: null });
    return createMfaChallenge(user);
  },
  async verifyMfa({ mfaToken, code }) {
    const challenge = mfaChallenges.get(mfaToken);
    if (!challenge) throw new ApiError(401, "MFA_INVALID", "Code de verification invalide ou expire");
    if (challenge.expiresAt < Date.now()) {
      mfaChallenges.delete(mfaToken);
      throw new ApiError(401, "MFA_EXPIRED", "Code de verification expire");
    }
    if (challenge.attempts >= 5) {
      mfaChallenges.delete(mfaToken);
      throw new ApiError(429, "MFA_ATTEMPTS_EXCEEDED", "Trop de tentatives de verification");
    }
    if (!/^\d{6}$/.test(String(code)) || hashCode(String(code)) !== challenge.codeHash) {
      challenge.attempts += 1;
      throw new ApiError(400, "MFA_INVALID", "Code de verification invalide");
    }

    mfaChallenges.delete(mfaToken);
    const user = await authRepository.findUserById(challenge.userId);
    if (!user || user.statut !== "ACTIF") throw new ApiError(401, "UNAUTHORIZED", "Utilisateur invalide");
    return issueSession(user);
  },
  async resendMfa({ mfaToken }) {
    const challenge = mfaChallenges.get(mfaToken);
    if (!challenge) throw new ApiError(401, "MFA_INVALID", "Session MFA invalide ou expiree");
    if (challenge.expiresAt < Date.now()) {
      mfaChallenges.delete(mfaToken);
      throw new ApiError(401, "MFA_EXPIRED", "Code de verification expire");
    }
    const now = Date.now();
    if (challenge.resendAfter > now) {
      throw new ApiError(429, "MFA_RESEND_TOO_SOON", "Veuillez patienter avant de renvoyer le code", {
        retryAfter: Math.ceil((challenge.resendAfter - now) / 1000),
      });
    }

    const user = await authRepository.findUserById(challenge.userId);
    if (!user || user.statut !== "ACTIF") throw new ApiError(401, "UNAUTHORIZED", "Utilisateur invalide");

    const code = generateMfaCode();
    challenge.codeHash = hashCode(code);
    challenge.resendAfter = now + MFA_RESEND_DELAY_MS;
    challenge.expiresAt = now + MFA_CODE_TTL_MS;
    challenge.attempts = 0;
    await sendMfaCodeEmail(user.email, user.prenom || user.nom || "Utilisateur", code);

    return {
      mfaRequired: true,
      method: "email",
      email: maskEmail(user.email),
      expiresIn: 600,
      resendAfter: 30,
    };
  },
  async logout(refreshToken) {
    if (!refreshToken) return { revoked: false };
    const existing = await authRepository.findRefreshToken(refreshToken);
    if (existing && !existing.isRevoked) await authRepository.revokeRefreshToken(refreshToken);
    return { revoked: true };
  },
  async refresh(refreshToken) {
    if (!refreshToken) throw new ApiError(401, "UNAUTHORIZED", "Refresh token requis");
    const stored = await authRepository.findRefreshToken(refreshToken);
    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new ApiError(401, "UNAUTHORIZED", "Refresh token invalide");
    }
    const payload = verifyRefreshToken(refreshToken);
    const user = await authRepository.findUserById(payload.userId);
    if (!user || user.statut !== "ACTIF") throw new ApiError(401, "UNAUTHORIZED", "Utilisateur invalide");
    const accessToken = generateAccessToken({
      userId: user.id,
      roleId: user.idRole,
      permissions: permissionsFromUser(user),
    });
    return { accessToken };
  },
  async me(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new ApiError(404, "NOT_FOUND", "Utilisateur introuvable");
    return publicUser(user);
  },
  async changePassword(userId, { ancienPassword, nouveauPassword }) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new ApiError(404, "NOT_FOUND", "Utilisateur introuvable");
    const valid = await bcrypt.compare(ancienPassword, user.passwordHash);
    if (!valid) throw new ApiError(400, "INVALID_PASSWORD", "Ancien mot de passe incorrect");
    const passwordHash = await bcrypt.hash(nouveauPassword, BCRYPT_ROUNDS);
    await authRepository.updateUser(userId, { passwordHash });
    return { changed: true };
  },
};
