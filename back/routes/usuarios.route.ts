/* Importa o Router do Express.
   O Router serve para criar um conjunto de rotas separadas do server.ts */
import { Router } from 'express';

/* Importa o middleware de autenticação */
import auth from '../middlewares/auth';

/* Importa as funções do controller de usuários */
import {
  listarUsuarios,
  criarUsuario,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
  login,
  logout
} from '../controllers/usuarios.controller';

/* Cria uma instância do Router */
const router = Router();

/* ================= ROTAS PÚBLICAS ================= */

/* POST /usuarios
   Cria um novo usuário (cadastro)
   → não precisa de autenticação */
router.post('/', criarUsuario);

/* ================= ROTAS PROTEGIDAS ================= */

/* GET /usuarios
   Lista todos os usuários
   → só usuários autenticados */
router.get('/', auth, listarUsuarios);

/* GET /usuarios/:id
   Busca um usuário pelo ID
   → precisa estar autenticado */
router.get('/:id', auth, buscarUsuarioPorId);

/* PUT /usuarios/:id
   Atualiza os dados de um usuário
   → precisa estar autenticado */
router.put('/:id', auth, atualizarUsuario);

/* DELETE /usuarios/:id
   Remove um usuário do sistema
   → precisa estar autenticado */
router.delete('/:id', auth, deletarUsuario);


/* Login */
router.post('/login', login);

/* Logout (rota protegida, opcional) */
router.post('/logout', auth, logout);


/* Exporta o router */
export default router;
