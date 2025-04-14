const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");
const { authenticate } = require("../middlewares/auth");
const passport = require("passport");

router.post("/register", controller.register);
router.post("/verify-otp", controller.verifyOtp);
router.post("/refresh", controller.refreshToken);
router.post("/login", controller.login);
router.post("/logout", authenticate, controller.logout);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/change-password", authenticate, controller.changePassword);
router.get("/me", authenticate, controller.getMe);
router.post("/2fa/setup", authenticate, controller.setup2FA);
router.post("/2fa/verify", controller.verify2FA);
router.post("/2fa/disable", authenticate, controller.disable2FA);
router.post(
  "/2fa/generate-backup-codes",
  authenticate,
  controller.generateBackupCodes,
);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Route callback sau khi đăng nhập thành công
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Tạo token và trả về cho client
    const { accessToken, refreshToken } = generateTokens(req.user);
    res.json({ accessToken, refreshToken });
  },
);
module.exports = router;
