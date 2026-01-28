import { Router } from 'express';
import {
  listarAulas,
  buscarAulaPorId,
  criarAula,
  atualizarAula,
  deletarAula
} from '../controllers/aulas.controller';

import { auth } from '../middlewares/auth';
import { adminOnly } from '../middlewares/adminOnly';

const router = Router();

// Rotas públicas ou apenas autenticadas
router.get('/', auth, listarAulas); // listar todas as aulas
router.get('/:id', auth, buscarAulaPorId); // buscar aula específica

// Rotas que apenas administradores podem acessar
router.post('/', auth, adminOnly, criarAula);
router.put('/:id', auth, adminOnly, atualizarAula);
router.delete('/:id', auth, adminOnly, deletarAula);

export default router;
