import { Router } from 'express';
import { login, confirmarCodigo, logout, habilitar2FA, desabilitar2FA } from '../controllers/usuarios.controller';
import { auth } from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.post('/confirmar-codigo', confirmarCodigo);

router.post('/logout', auth, logout);

router.patch('/2fa/habilitar', auth, habilitar2FA);
router.patch('/2fa/desabilitar', auth, desabilitar2FA);

export default router;
