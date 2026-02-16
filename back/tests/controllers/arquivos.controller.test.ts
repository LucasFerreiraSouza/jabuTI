import { Response } from "express";
import cloudinary from "../../config/cloudinary";
import Usuario from "../../models/usuarios.model";
import { Aula } from "../../models/aulas.model";

import {
  uploadAvatar,
  deleteAvatar,
  uploadImagemConteudo,
  deleteImagemConteudo
} from "../../controllers/arquivos.controller";

jest.mock("../../models/usuarios.model");
jest.mock("../../models/aulas.model");
jest.mock("../../config/cloudinary", () => ({
  uploader: {
    upload: jest.fn(),
    destroy: jest.fn()
  }
}));

describe("upload.controller", () => {
  let req: any;
  let res: Partial<Response>;

  beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});

  (cloudinary.uploader.upload as jest.Mock).mockClear();
  (cloudinary.uploader.destroy as jest.Mock).mockClear();

  req = {
    body: {},
    file: undefined,
    user: { id: "userId" }
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
});

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ======================================================
  // uploadAvatar
  // ======================================================

  test("deve retornar 400 se não enviar arquivo", async () => {
    await uploadAvatar(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deve fazer upload do avatar corretamente", async () => {
    req.file = { path: "file.png" };

    (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({
      secure_url: "http://cloud/avatar.png"
    });

    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await uploadAvatar(req, res as Response);

    expect(cloudinary.uploader.upload).toHaveBeenCalled();
    expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith("userId", {
      avatar: { url: "http://cloud/avatar.png" }
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      url: "http://cloud/avatar.png"
    });
  });

  test("deve retornar 500 se ocorrer erro no uploadAvatar", async () => {
    req.file = { path: "file.png" };

    (cloudinary.uploader.upload as jest.Mock).mockRejectedValue(new Error());

    await uploadAvatar(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ======================================================
  // deleteAvatar
  // ======================================================

  test("deve retornar 400 se url não for enviada", async () => {
    await deleteAvatar(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deve deletar avatar corretamente", async () => {
    req.body = {
      url: "https://res.cloudinary.com/demo/image/upload/v123/avatars/test.png"
    };

    (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({});

    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await deleteAvatar(req, res as Response);

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("avatars/test");

    expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith("userId", {
      $unset: { avatar: "" }
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deve retornar 500 se ocorrer erro no deleteAvatar", async () => {
    req.body = {
      url: "https://res.cloudinary.com/demo/image/upload/v123/avatars/test.png"
    };

    (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(new Error());

    await deleteAvatar(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ======================================================
  // uploadImagemConteudo
  // ======================================================

  test("deve retornar 400 se não enviar arquivo", async () => {
    await uploadImagemConteudo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deve retornar 400 se aulaId não for enviado", async () => {
    req.file = { path: "file.png" };

    await uploadImagemConteudo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deve retornar 400 se conteudoId não for enviado", async () => {
    req.file = { path: "file.png" };
    req.body = { aulaId: "a1" };

    await uploadImagemConteudo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deve retornar 404 se aula não existir", async () => {
    req.file = { path: "file.png" };
    req.body = { aulaId: "a1", conteudoId: "c1" };

    (Aula.findById as jest.Mock).mockResolvedValue(null);

    await uploadImagemConteudo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deve retornar 404 se conteúdo não existir", async () => {
    req.file = { path: "file.png" };
    req.body = { aulaId: "a1", conteudoId: "c1" };

    const aulaMock = {
      conteudos: {
        id: jest.fn().mockReturnValue(null)
      }
    };

    (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

    await uploadImagemConteudo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deve fazer upload da imagem do conteúdo corretamente", async () => {
    req.file = { path: "file.png" };
    req.body = { aulaId: "a1", conteudoId: "c1" };

    const conteudoMock: any = {};

    const aulaMock: any = {
      conteudos: {
        id: jest.fn().mockReturnValue(conteudoMock)
      },
      save: jest.fn()
    };

    (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

    (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({
      secure_url: "http://cloud/aula.png"
    });

    await uploadImagemConteudo(req, res as Response);

    expect(conteudoMock.imagem).toEqual({
      url: "http://cloud/aula.png"
    });

    expect(aulaMock.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("deve retornar 500 se ocorrer erro no uploadImagemConteudo", async () => {
    req.file = { path: "file.png" };
    req.body = { aulaId: "a1", conteudoId: "c1" };

    (Aula.findById as jest.Mock).mockRejectedValue(new Error());

    await uploadImagemConteudo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ======================================================
  // deleteImagemConteudo
  // ======================================================

  test("deve retornar 400 se aulaId não for enviado", async () => {
    await deleteImagemConteudo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deve retornar 400 se conteudoId não for enviado", async () => {
    req.body = { aulaId: "a1" };

    await deleteImagemConteudo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deve retornar 404 se aula não existir", async () => {
    req.body = { aulaId: "a1", conteudoId: "c1" };

    (Aula.findById as jest.Mock).mockResolvedValue(null);

    await deleteImagemConteudo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deve retornar 404 se conteúdo não existir", async () => {
    req.body = { aulaId: "a1", conteudoId: "c1" };

    const aulaMock = {
      conteudos: {
        id: jest.fn().mockReturnValue(null)
      }
    };

    (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

    await deleteImagemConteudo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deve remover imagem sem chamar cloudinary se url não for enviada", async () => {
    req.body = { aulaId: "a1", conteudoId: "c1" };

    const conteudoMock: any = {
      imagem: { url: "x" }
    };

    const aulaMock: any = {
      conteudos: {
        id: jest.fn().mockReturnValue(conteudoMock)
      },
      save: jest.fn()
    };

    (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

    await deleteImagemConteudo(req, res as Response);

    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    expect(conteudoMock.imagem).toBeUndefined();
    expect(aulaMock.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deve remover imagem chamando cloudinary quando url existir", async () => {
    req.body = {
      aulaId: "a1",
      conteudoId: "c1",
      url: "https://res.cloudinary.com/demo/image/upload/v123/aulas/img.png"
    };

    const conteudoMock: any = {
      imagem: { url: "x" }
    };

    const aulaMock: any = {
      conteudos: {
        id: jest.fn().mockReturnValue(conteudoMock)
      },
      save: jest.fn()
    };

    (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

    (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({});

    await deleteImagemConteudo(req, res as Response);

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("aulas/img");
    expect(conteudoMock.imagem).toBeUndefined();
    expect(aulaMock.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deve retornar 500 se ocorrer erro no deleteImagemConteudo", async () => {
    req.body = {
      aulaId: "a1",
      conteudoId: "c1"
    };

    (Aula.findById as jest.Mock).mockRejectedValue(new Error());

    await deleteImagemConteudo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});