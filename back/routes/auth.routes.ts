import { Router } from "express";
import { auth } from "../middlewares/auth";
import {
  habilitar2FA,
  desabilitar2FA,
  login,
  logout,
  confirmarCodigo,
  // ... outros handlers
} from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/confirmar-codigo", confirmarCodigo);
router.post("/logout", auth, logout);

router.patch("/2fa/habilitar", auth, habilitar2FA);
router.patch("/2fa/desabilitar", auth, desabilitar2FA);

export default router;
