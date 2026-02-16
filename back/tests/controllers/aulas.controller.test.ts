import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { Aula } from '../../models/aulas.model';

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

/* ============================
   MOCK DO CLOUDINARY
============================ */
jest.mock('../../config/cloudinary', () => ({
  uploader: {
    destroy: jest.fn()
  }
}));

describe('aulas.controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  const validId = '507f1f77bcf86cd799439011';

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
    (Aula.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    });

    await listarAulas(req as Request, res as Response);

    expect(Aula.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve retornar 500 em erro ao listar aulas', async () => {
    (Aula.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error())
    });

    await listarAulas(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // buscarAulaPorId
  // =========================
  it('deve retornar 404 se aula não existir', async () => {
    req.params = { id: validId };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    (Aula.findById as jest.Mock).mockResolvedValue(null);

    await buscarAulaPorId(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deve retornar aula por id', async () => {
    req.params = { id: validId };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    (Aula.findById as jest.Mock).mockResolvedValue({ _id: validId });

    await buscarAulaPorId(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve retornar 400 se id inválido', async () => {
    req.params = { id: 'invalido' };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);

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
    req.body = { titulo: 'Aula', descricao: 'Desc' };
    await criarAula(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deve criar aula com sucesso', async () => {
    req.body = { titulo: 'Aula', descricao: 'Desc' };
    (req as any).user = { id: validId, username: 'teste' };
    (Aula.create as jest.Mock).mockResolvedValue({ _id: validId, titulo: 'Aula' });

    await criarAula(req as Request, res as Response);

    expect(Aula.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('deve retornar 500 se erro ao criar aula', async () => {
    req.body = { titulo: 'Aula', descricao: 'Desc' };
    (req as any).user = { id: validId, username: 'teste' };
    (Aula.create as jest.Mock).mockRejectedValue(new Error());

    await criarAula(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // atualizarAula
  // =========================
  it('deve retornar 404 se aula não existir ao atualizar', async () => {
    req.params = { id: validId };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    (Aula.findById as jest.Mock).mockResolvedValue(null);

    await atualizarAula(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deve atualizar aula com sucesso', async () => {
    req.params = { id: validId };
    req.body = { titulo: 'Novo título' };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);

    (Aula.findById as jest.Mock).mockResolvedValue({
      titulo: 'Antigo',
      conteudos: { id: jest.fn() },
      save: jest.fn()
    });

    await atualizarAula(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve retornar 500 se erro ao atualizar aula', async () => {
    req.params = { id: validId };
    req.body = { titulo: 'Novo título' };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);

    (Aula.findById as jest.Mock).mockImplementation(() => { throw new Error(); });

    await atualizarAula(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('deve atualizar um conteudo existente na aula', async () => {
    req.params = { id: validId };
    req.body = { conteudos: [{ _id: 'conteudo1', titulo: 'Título atualizado', backgroundColor: '#ff0000', textColor: '#00ff00' }] };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);

    const saveMock = jest.fn();
    const aulaMock: any = {
      conteudos: { id: jest.fn().mockReturnValue({ tipo: 'texto', titulo: 'Antigo', descricao: '', texto: '', codigo: '', video: '', imagem: { url: '' }, exercicio: [], ordem: 0, backgroundColor: '#ffffff', textColor: '#000000' }) },
      save: saveMock
    };
    (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

    await atualizarAula(req as Request, res as Response);
    expect(aulaMock.conteudos.id).toHaveBeenCalledWith('conteudo1');
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve adicionar um novo conteudo na aula', async () => {
    req.params = { id: validId };
    req.body = { conteudos: [{ tipo: 'texto', titulo: 'Novo Conteudo' }] };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);

    const aulaMock: any = { conteudos: [], save: jest.fn(), criadoPor: validId };
    (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);
    (req as any).user = { username: 'teste' };

    await atualizarAula(req as Request, res as Response);
    expect(aulaMock.conteudos.length).toBe(1);
    expect(aulaMock.conteudos[0].titulo).toBe('Novo Conteudo');
    expect(res.status).toHaveBeenCalledWith(200);
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
    req.params = { id: validId };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    (Aula.findById as jest.Mock).mockResolvedValue(null);

    await deletarAula(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deve deletar aula com sucesso sem imagens', async () => {
    req.params = { id: validId };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    (Aula.findById as jest.Mock).mockResolvedValue({ conteudos: [] });
    (Aula.findByIdAndDelete as jest.Mock).mockResolvedValue({});

    await deletarAula(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve deletar aula quando id vem como array', async () => {
    req.params = { id: [validId] as any };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    (Aula.findById as jest.Mock).mockResolvedValue({ conteudos: [] });
    (Aula.findByIdAndDelete as jest.Mock).mockResolvedValue({});

    await deletarAula(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve deletar aula com imagens no Cloudinary', async () => {
    const cloudinary = require('../../config/cloudinary');
    req.params = { id: validId };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);

    const aulaMock: any = { conteudos: [{ imagem: { url: 'http://res.cloudinary.com/demo/upload/v1234/teste.jpg' } }] };
    (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);
    (Aula.findByIdAndDelete as jest.Mock).mockResolvedValue({});
    const destroyMock = jest.spyOn(cloudinary.uploader, 'destroy').mockResolvedValue({});

    await deletarAula(req as Request, res as Response);
    expect(destroyMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve retornar 500 se erro ao deletar aula', async () => {
    req.params = { id: validId };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    (Aula.findById as jest.Mock).mockImplementation(() => { throw new Error(); });

    await deletarAula(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});