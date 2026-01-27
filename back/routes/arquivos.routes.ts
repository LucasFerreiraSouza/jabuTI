import { Router } from "express";
import {
  uploadAvatar,
  deleteAvatar,
  uploadImagemAula,
  deleteImagemAula
} from "../controllers/arquivos.controller";
import { upload } from "../middlewares/arquivos.middleware";
import { auth } from "../middlewares/auth";
import { adminOnly } from "../middlewares/adminOnly";

const router = Router();

/* =========================
   AVATAR (perfil do usuário)
   ========================= */
router.post("/avatar/upload", auth, upload.single("file"), uploadAvatar);
router.delete("/avatar/delete", auth, deleteAvatar);

/* =========================
   IMAGEM DA AULA (somente admin)
   ========================= */
router.post(
  "/aula/upload",
  auth,
  adminOnly,
  upload.single("file"),
  uploadImagemAula
);

router.delete(
  "/aula/delete",
  auth,
  adminOnly,
  deleteImagemAula
);

export default router;
