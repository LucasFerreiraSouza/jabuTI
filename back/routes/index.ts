import { Router } from 'express';
import authRoutes from './auth.routes';
import cadastroRoutes from './cadastro.routes';
import adminRoutes from './admin.routes';
import aulaRoutes from './aulas.route';


const router = Router();

router.use('/auth', authRoutes);
router.use('/cadastro', cadastroRoutes);
router.use('/admin', adminRoutes);
router.use('/aula', aulaRoutes);


export default router;
