import { Router } from 'express';
import {
  alterarBackgroundAula,
  alterarBackgroundConteudo,
  alterarTextAula,
  alterarTextConteudo,
  alterarOrdemAula,
  alterarOrdemConteudo,
  alterarBackgroundSite,
  alterarTextColorSite
} from '../controllers/personalizaveis.controller';

import { auth } from '../middlewares/auth';
import { adminOnly } from '../middlewares/adminOnly';

const router = Router();

// Alterações de cores da aula
router.patch('/aula/:aulaId/background', auth, adminOnly, alterarBackgroundAula);
router.patch('/aula/:aulaId/text', auth, adminOnly, alterarTextAula);
router.patch('/aula/:aulaId/ordem', auth, adminOnly, alterarOrdemAula);

// Alterações de cores e ordem de um conteúdo específico
router.patch('/aula/:aulaId/conteudo/:conteudoId/background', auth, adminOnly, alterarBackgroundConteudo);
router.patch('/aula/:aulaId/conteudo/:conteudoId/text', auth, adminOnly, alterarTextConteudo);
router.patch('/aula/:aulaId/conteudo/:conteudoId/ordem', auth, adminOnly, alterarOrdemConteudo);

// Alterações globais do site
router.patch('/site/background', auth, adminOnly, alterarBackgroundSite);
router.patch('/site/text', auth, adminOnly, alterarTextColorSite);


export default router;
