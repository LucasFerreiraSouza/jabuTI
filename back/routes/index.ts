import { Router } from 'express';
import authRoutes from './auth.routes';
import cadastroRoutes from './cadastro.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cadastro', cadastroRoutes);
router.use('/admin', adminRoutes);

export default router;
