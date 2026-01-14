import 'dotenv/config';
import express from 'express';
import connectDB from './config/db';

/* importa o index das rotas */
import apiRoutes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

/* conecta no banco */
connectDB();

/* middleware JSON */
app.use(express.json());

/* 🔥 PREFIXO GLOBAL /api */
app.use('/api', apiRoutes);

/* health check */
app.get('/', (_req, res) => {
  res.send('🟢 API jabuTI rodando');
});

/* inicia servidor */
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
