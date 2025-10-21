import express from "express";
import * as authController from "../controllers/auth.controller.js";
import * as validationRules from "../middlewares/validator.middleware.js";
import passport from "passport";
const router = express.Router();

router.post(
  "/register",
  validationRules.registerValidationRules,
  authController.register
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleAuthCallback
);

router.post(
  "/login",
  validationRules.loginValidationRules,
  authController.login
);

export default router;
