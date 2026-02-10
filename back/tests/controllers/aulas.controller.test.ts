import { Request, Response } from 'express';
import mongoose from 'mongoose';

import {Aula} from '../../models/aulas.model';

import {
  listarAulas,
  buscarAulaPorId,
  criarAula,
  atualizarAula,
  deletarAula
} from '../../controllers/aulas.controller';

/* ============================
   MOCK DO MODEL
   ============================ */
jest.mock('../../models/aulas.model');

describe('aulas.controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { body: {}, params: {} };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =========================
  // listarAulas
  // =========================
  it('deve listar aulas', async () => {
    (Aula.find as jest.Mock).mockResolvedValue([]);

    await listarAulas(req as Request, res as Response);

    expect(Aula.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve retornar 500 em erro ao listar aulas', async () => {
    (Aula.find as jest.Mock).mockRejectedValue(new Error());

    await listarAulas(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // buscarAulaPorId
  // =========================
  it('deve retornar 404 se aula não existir', async () => {
    req.params = { id: '123' };

    (Aula.findById as jest.Mock).mockResolvedValue(null);

    await buscarAulaPorId(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deve retornar aula por id', async () => {
    req.params = { id: '123' };

    (Aula.findById as jest.Mock).mockResolvedValue({ _id: '123' });

    await buscarAulaPorId(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve retornar 400 se id inválido', async () => {
    req.params = { id: 'invalido' };

    (Aula.findById as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await buscarAulaPorId(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // =========================
  // criarAula
  // =========================
  it('deve retornar 400 se campos obrigatórios não enviados', async () => {
    req.body = { titulo: 'Aula 1' };

    await criarAula(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deve retornar 400 se criadoPor não informado', async () => {
    req.body = {
      titulo: 'Aula',
      descricao: 'Desc',
      texto: 'Texto',
      video: 'Video',
      codigo: 'Codigo',
      exercicio: 'Ex',
      imagem: 'Img',
      publicada: true
    };

    // NÃO seta req.userId

    await criarAula(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deve criar aula com sucesso', async () => {
    req.body = {
      titulo: 'Aula',
      descricao: 'Desc',
      texto: 'Texto',
      video: 'Video',
      codigo: 'Codigo',
      exercicio: 'Ex',
      imagem: 'Img',
      publicada: true
    };

    (req as any).userId = 'user123';

    (Aula.create as jest.Mock).mockResolvedValue({
      _id: '123',
      titulo: 'Aula'
    });

    await criarAula(req as Request, res as Response);

    expect(Aula.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('deve retornar 500 se erro ao criar aula', async () => {
    req.body = {
      titulo: 'Aula',
      descricao: 'Desc',
      texto: 'Texto',
      video: 'Video',
      codigo: 'Codigo',
      exercicio: 'Ex',
      imagem: 'Img',
      publicada: true
    };

    (req as any).userId = 'user123';

    (Aula.create as jest.Mock).mockRejectedValue(new Error());

    await criarAula(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // atualizarAula
  // =========================
  it('deve retornar 404 se aula não existir ao atualizar', async () => {
    req.params = { id: '123' };

    (Aula.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await atualizarAula(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deve atualizar aula com sucesso', async () => {
    req.params = { id: '123' };
    req.body = { titulo: 'Novo título' };

    (Aula.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    await atualizarAula(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve retornar 400 se erro ao atualizar aula', async () => {
    req.params = { id: '123' };
    req.body = { titulo: 'Novo título' };

    (Aula.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await atualizarAula(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // =========================
  // deletarAula
  // =========================
  it('deve retornar 400 se id inválido', async () => {
    req.params = { id: 'invalido' };

    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);

    await deletarAula(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deve retornar 404 se aula não existir ao deletar', async () => {
    req.params = { id: '507f1f77bcf86cd799439011' };

    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    (Aula.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    await deletarAula(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deve deletar aula com sucesso', async () => {
    req.params = { id: '507f1f77bcf86cd799439011' };

    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    (Aula.findByIdAndDelete as jest.Mock).mockResolvedValue({});

    await deletarAula(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve deletar aula quando id vem como array', async () => {
    req.params = { id: ['507f1f77bcf86cd799439011'] };

    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    (Aula.findByIdAndDelete as jest.Mock).mockResolvedValue({});

    await deletarAula(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve retornar 500 se erro ao deletar aula', async () => {
    req.params = { id: '507f1f77bcf86cd799439011' };

    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    (Aula.findByIdAndDelete as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await deletarAula(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
