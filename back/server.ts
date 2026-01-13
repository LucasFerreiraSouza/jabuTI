/* Carrega as variáveis de ambiente do arquivo .env */
import 'dotenv/config';

/* Importa o Express para criar o servidor HTTP */
import express from 'express';

/* Importa a função de conexão com o banco */
import connectDB from './config/db';

/* Importa as rotas da aplicação */
import usuariosRoutes from './routes/usuarios.route';
import aulasRoutes from './routes/aulas.route';

/* Cria a aplicação Express */
const app = express();

/* Porta do servidor (usa .env ou padrão 3000) */
const PORT = process.env.PORT || 3000;

/* Conecta no banco de dados */
connectDB();

/* Middleware para permitir JSON no body das requisições */
app.use(express.json());

/* Rotas */
app.use('/usuarios', usuariosRoutes);
app.use('/aulas', aulasRoutes);

/* Rota de teste (opcional) */
app.get('/', (_req, res) => {
  res.send('🟢 API jabuTI rodando');
});

/* Inicia o servidor */
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
