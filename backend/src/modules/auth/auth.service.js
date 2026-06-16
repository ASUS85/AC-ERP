import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { ApiError } from "../../utils/response.util.js";
import { BCRYPT_ROUNDS } from "../../config/constants.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../services/jwt.service.js";
import { authRepository } from "./auth.repository.js";

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
    const payload = { userId: user.id, roleId: user.idRole, permissions: permissionsFromUser(user) };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: user.id });
    await authRepository.createRefreshToken({
      token: refreshToken,
      idUtilisateur: user.id,
      expiresAt: refreshExpiry(),
    });

    return { user: publicUser(user), accessToken, refreshToken };
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

