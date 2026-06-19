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
  async verifyMfa(req, res, next) {
    try {
      return sendSuccess(res, await authService.verifyMfa(req.body), "Verification MFA reussie");
    } catch (error) {
      next(error);
    }
  },
  async resendMfa(req, res, next) {
    try {
      return sendSuccess(res, await authService.resendMfa(req.body), "Code MFA renvoye");
    } catch (error) {
      next(error);
    }
  },
  async forgotPassword(req, res, next) {
    try {
      return sendSuccess(res, await authService.forgotPassword(req.body), "Si cette adresse existe, un email de reinitialisation a ete envoye");
    } catch (error) {
      next(error);
    }
  },
  async resetPassword(req, res, next) {
    try {
      return sendSuccess(res, await authService.resetPassword(req.body), "Mot de passe reinitialise");
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
