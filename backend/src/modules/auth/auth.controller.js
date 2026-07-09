import { ApiError, sendSuccess } from "../../utils/response.util.js";
import { authService } from "./auth.service.js";

export const authController = {
  async login(req, res, next) {
    try {
      return sendSuccess(
        res,
        await authService.login(req.body),
        "Connexion reussie",
      );
    } catch (error) {
      next(error);
    }
  },
  async logout(req, res, next) {
    try {
      return sendSuccess(
        res,
        await authService.logout(req.body.refreshToken),
        "Deconnexion reussie",
      );
    } catch (error) {
      next(error);
    }
  },
  async refresh(req, res, next) {
    try {
      return sendSuccess(
        res,
        await authService.refresh(req.body.refreshToken),
        "Token renouvele",
      );
    } catch (error) {
      next(error);
    }
  },
  async verifyMfa(req, res, next) {
    try {
      return sendSuccess(
        res,
        await authService.verifyMfa(req.body),
        "Verification MFA reussie",
      );
    } catch (error) {
      next(error);
    }
  },
  async resendMfa(req, res, next) {
    try {
      return sendSuccess(
        res,
        await authService.resendMfa(req.body),
        "Code MFA renvoye",
      );
    } catch (error) {
      next(error);
    }
  },
  async forgotPassword(req, res, next) {
    try {
      return sendSuccess(
        res,
        await authService.forgotPassword(req.body),
        "Si cette adresse existe, un email de reinitialisation a ete envoye",
      );
    } catch (error) {
      next(error);
    }
  },
  async resetPassword(req, res, next) {
    try {
      return sendSuccess(
        res,
        await authService.resetPassword(req.body),
        "Mot de passe reinitialise",
      );
    } catch (error) {
      next(error);
    }
  },
  async me(req, res, next) {
    try {
      return sendSuccess(
        res,
        await authService.me(req.user.userId),
        "Profil recupere",
      );
    } catch (error) {
      next(error);
    }
  },
  async updateProfile(req, res, next) {
    try {
      return sendSuccess(
        res,
        await authService.updateProfile(req.user.userId, req.body),
        "Profil modifie",
      );
    } catch (error) {
      next(error);
    }
  },
  async uploadAvatar(req, res, next) {
    try {
      if (!req.file)
        throw new ApiError(
          400,
          "AVATAR_REQUIRED",
          "Aucun fichier avatar fourni",
        );
      return sendSuccess(
        res,
        { avatar: `/uploads/${req.file.filename}` },
        "Avatar importe",
        null,
        201,
      );
    } catch (error) {
      next(error);
    }
  },
  async sessions(req, res, next) {
    try {
      return sendSuccess(
        res,
        await authService.sessions(req.user.userId),
        "Sessions recuperees",
      );
    } catch (error) {
      next(error);
    }
  },
  async revokeOtherSessions(req, res, next) {
    try {
      return sendSuccess(
        res,
        await authService.revokeOtherSessions(
          req.user.userId,
          req.body.refreshToken,
        ),
        "Autres sessions revoquees",
      );
    } catch (error) {
      next(error);
    }
  },
  async changePassword(req, res, next) {
    try {
      return sendSuccess(
        res,
        await authService.changePassword(req.user.userId, req.body),
        "Mot de passe modifie",
      );
    } catch (error) {
      next(error);
    }
  },
};
