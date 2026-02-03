import { Router } from "express";

import {
  dashboardExercicio,
  rankingExercicio
} from "../controllers/analiticos.controller";

import { auth } from "../middlewares/auth";
import { adminOnly } from "../middlewares/adminOnly";

const router = Router();

/**
 * Dashboard analítico de um exercício
 * (apenas admin)
 *
 * Query opcional:
 * ?inicio=2026-02-01&fim=2026-02-02
 */
router.get(
  "/exercicio/:aulaId/:conteudoId/:exercicioId/dashboard",
  auth,
  adminOnly,
  dashboardExercicio
);

/**
 * Ranking por exercício
 * (apenas admin)
 *
 * Query opcional:
 * ?inicio=2026-02-01&fim=2026-02-02
 */
router.get(
  "/exercicio/:aulaId/:conteudoId/:exercicioId/ranking",
  auth,
  adminOnly,
  rankingExercicio
);

export default router;
