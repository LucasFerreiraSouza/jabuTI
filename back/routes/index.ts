import { Router } from 'express';

// Rotas
import authRoutes from './auth.routes';
import cadastroRoutes from './cadastro.routes';
import adminRoutes from './admin.routes';
import aulasRoutes from './aulas.routes';
import arquivosRoutes from './arquivos.routes';
import conteudosRoutes from './conteudos.routes';
import exerciciosRoutes from './exercicios.routes';
import personalizaveisRoutes from './personalizaveis.routes';

const router = Router();

// Middleware de rotas
router.use('/auth', authRoutes);
router.use('/cadastro', cadastroRoutes);
router.use('/admin', adminRoutes);
router.use('/aulas', aulasRoutes);
router.use('/arquivos', arquivosRoutes);
router.use('/conteudos', conteudosRoutes);
router.use('/exercicios', exerciciosRoutes);
router.use('/personalizaveis', personalizaveisRoutes);

export default router;
