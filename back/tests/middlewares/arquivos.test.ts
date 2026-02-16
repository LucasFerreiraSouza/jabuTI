import { upload } from '../../middlewares/arquivos';

describe('middlewares/arquivos (multer upload)', () => {

  it('deve exportar o objeto upload', () => {
    expect(upload).toBeDefined();
  });

  it('deve possuir o método single', () => {
    expect(typeof upload.single).toBe('function');
  });

  it('upload.single deve retornar um middleware', () => {
    const middleware = upload.single('file');

    expect(typeof middleware).toBe('function');
    // middleware do express sempre recebe (req, res, next)
    expect(middleware.length).toBeGreaterThanOrEqual(2);
  });

});