import { Router } from 'express';
import {
  registrarUsuario,
  ativarSenha,
  solicitarResetSenha,
  resetarSenha,
  solicitarResetEmail,
  resetarEmail
} from '../controllers/usuarios.controller';

const router = Router();

router.post('/registrar', registrarUsuario);

router.post('/ativar-senha/:token', ativarSenha);

router.post('/solicitar-reset-senha', solicitarResetSenha);
router.post('/resetar-senha', resetarSenha);

router.post('/solicitar-reset-email', solicitarResetEmail);
router.post('/resetar-email', resetarEmail);

export default router;
