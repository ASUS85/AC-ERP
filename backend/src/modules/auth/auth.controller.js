import { sendSuccess } from "../../utils/response.util.js";
import { authService } from "./auth.service.js";

export const authController = {
  async login(req, res, next) {
    try {
      return sendSuccess(res, await authService.login(req.body), "Connexion reussie");
    } catch (error) {
      next(error);
    }
  },
  async logout(req, res, next) {
    try {
      return sendSuccess(res, await authService.logout(req.body.refreshToken), "Deconnexion reussie");
    } catch (error) {
      next(error);
    }
  },
  async refresh(req, res, next) {
    try {
      return sendSuccess(res, await authService.refresh(req.body.refreshToken), "Token renouvele");
    } catch (error) {
      next(error);
    }
  },
  async me(req, res, next) {
    try {
      return sendSuccess(res, await authService.me(req.user.userId), "Profil recupere");
    } catch (error) {
      next(error);
    }
  },
  async changePassword(req, res, next) {
    try {
      return sendSuccess(res, await authService.changePassword(req.user.userId, req.body), "Mot de passe modifie");
    } catch (error) {
      next(error);
    }
  },
};

