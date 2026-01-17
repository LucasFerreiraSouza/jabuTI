import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import 'dotenv/config';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não encontrado no .env');
}

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (_req, res) => {
  res.send('🟢 API jabuTI rodando');
});

export default app;
