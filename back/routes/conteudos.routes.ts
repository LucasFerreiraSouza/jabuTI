import { Router } from 'express';
import {
  listarConteudos,
  adicionarConteudo,
  atualizarConteudo,
  deletarConteudo
} from '../controllers/conteudos.controller';

import { auth } from '../middlewares/auth';
import { adminOnly } from '../middlewares/adminOnly';

const router = Router();

// Listar conteúdos de uma aula (apenas autenticado)
router.get('/:aulaId', auth, listarConteudos);

// Adicionar conteúdo a uma aula (apenas admin)
router.post('/:aulaId', auth, adminOnly, adicionarConteudo);

// Atualizar conteúdo de uma aula (apenas admin)
router.put('/:aulaId/:conteudoId', auth, adminOnly, atualizarConteudo);

// Deletar conteúdo de uma aula (apenas admin)
router.delete('/:aulaId/:conteudoId', auth, adminOnly, deletarConteudo);

export default router;
