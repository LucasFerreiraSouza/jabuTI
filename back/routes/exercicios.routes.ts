import { Router } from 'express';
import {
  listarExercicios,
  adicionarExercicio,
  deletarExercicio,
  responderExercicio
} from '../controllers/exercicios.controller';

import { auth } from '../middlewares/auth';
import { adminOnly } from '../middlewares/adminOnly';

const router = Router();

// Listar exercícios de um conteúdo (apenas autenticado)
router.get('/:aulaId/:conteudoId', auth, listarExercicios);

// Adicionar exercício a um conteúdo (apenas admin)
router.post('/:aulaId/:conteudoId', auth, adminOnly, adicionarExercicio);

// Deletar exercício (apenas admin)
router.delete('/:aulaId/:conteudoId/:exercicioId', auth, adminOnly, deletarExercicio);

// Responder exercício (apenas autenticado)
router.post('/:aulaId/:conteudoId/:exercicioId/responder', auth, responderExercicio);

export default router;
