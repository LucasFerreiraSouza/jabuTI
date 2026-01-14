import { Router } from 'express';
import usuariosRoutes from './usuarios.route';
import aulasRoutes from './aulas.route';

const router = Router();

router.use('/usuarios', usuariosRoutes);
router.use('/aulas', aulasRoutes);

export default router;
