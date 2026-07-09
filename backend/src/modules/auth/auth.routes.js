import { Router } from "express";
import { authLimiter } from "../../middlewares/rateLimiter.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { uploadSingle } from "../../middlewares/upload.middleware.js";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/login", authLimiter, authController.login);
router.post("/verify-mfa", authLimiter, authController.verifyMfa);
router.post("/resend-mfa", authLimiter, authController.resendMfa);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);
router.put("/me", authenticate, authController.updateProfile);
router.post(
  "/me/avatar",
  authenticate,
  uploadSingle("avatar"),
  authController.uploadAvatar,
);
router.get("/sessions", authenticate, authController.sessions);
router.delete(
  "/sessions/others",
  authenticate,
  authController.revokeOtherSessions,
);
router.put("/change-password", authenticate, authController.changePassword);

export default router;
