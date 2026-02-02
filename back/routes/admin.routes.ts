import { Router } from 'express';
import {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
  aprovarUsuario,
  aprovacaoAutomatica,
  reprovarUsuario,
  promoverAdmin,
  despromoverAdmin
} from '../controllers/admin.controller';

import { auth } from '../middlewares/auth';
import { adminOnly } from '../middlewares/adminOnly';
import { emailLimiter } from '../middlewares/rateLimit';

const router = Router();

router.get('/', auth, adminOnly, listarUsuarios);
router.get('/:id', auth, adminOnly, buscarUsuarioPorId);

router.post('/', auth, adminOnly, criarUsuario);
router.put('/:id', auth, adminOnly, atualizarUsuario);
router.delete('/:id', auth, adminOnly, deletarUsuario);

router.patch('/:id/aprovar', auth, adminOnly, emailLimiter, aprovarUsuario);
router.patch('/config/aprovacao-automatica',auth,adminOnly,aprovacaoAutomatica);
router.patch('/:id/reprovar', auth, adminOnly, emailLimiter, reprovarUsuario);

router.patch('/:id/promover-admin', auth, adminOnly, promoverAdmin);
router.patch('/:id/despromover-admin', auth, adminOnly, despromoverAdmin);

export default router;
