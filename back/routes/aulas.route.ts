/* Importa o Router do Express,
   permitindo criar rotas específicas para aulas */
import { Router } from 'express';

/* Importa o middleware de autenticação.
   Ele verifica se o usuário está logado (token JWT válido) */
import auth from '../middlewares/auth';

/* Importa as funções do controller de aulas.
   Cada função é responsável por executar uma ação */
import {
  listarAulas,
  criarAula,
  buscarAulaPorId,
  atualizarAula,
  deletarAula
} from '../controllers/aulas.controller';

/* Cria uma instância do Router para as rotas de aulas */
const router = Router();

/* ================= ROTAS PÚBLICAS ================= */

/* GET /aulas
   Lista todas as aulas
   → qualquer pessoa pode acessar */
router.get('/', listarAulas);

/* GET /aulas/:id
   Busca uma aula específica pelo ID
   → qualquer pessoa pode acessar */
router.get('/:id', buscarAulaPorId);

/* ================= ROTAS PROTEGIDAS ================= */

/* POST /aulas
   Cria uma nova aula
   → só usuários autenticados podem criar */
router.post('/', auth, criarAula);

/* PUT /aulas/:id
   Atualiza uma aula existente
   → precisa estar autenticado */
router.put('/:id', auth, atualizarAula);

/* DELETE /aulas/:id
   Remove uma aula do sistema
   → precisa estar autenticado */
router.delete('/:id', auth, deletarAula);

/* Exporta o router para uso no server.ts */
export default router;
