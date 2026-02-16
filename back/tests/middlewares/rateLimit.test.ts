import rateLimit from 'express-rate-limit';

jest.mock('express-rate-limit', () => {
  return jest.fn(() => jest.fn());
});

describe('rateLimit middlewares', () => {

  it('deve criar todos os limiters com as configurações corretas', async () => {

    const middlewares = await import('../../middlewares/rateLimit');

    const {
      defaultLimiter,
      loginLimiter,
      registerLimiter,
      emailLimiter
    } = middlewares;

    const calls = (rateLimit as jest.Mock).mock.calls;

    // defaultLimiter
    expect(calls).toContainEqual([
      expect.objectContaining({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false
      })
    ]);

    // loginLimiter
    expect(calls).toContainEqual([
      expect.objectContaining({
        windowMs: 15 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: { erro: 'Muitas tentativas de login. Tente novamente mais tarde.' }
      })
    ]);

    // registerLimiter
    expect(calls).toContainEqual([
      expect.objectContaining({
        windowMs: 60 * 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        message: { erro: 'Muitos cadastros a partir deste IP.' }
      })
    ]);

    // emailLimiter
    expect(calls).toContainEqual([
      expect.objectContaining({
        windowMs: 60 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: { erro: 'Limite de envio de e-mails atingido.' }
      })
    ]);

    expect(typeof defaultLimiter).toBe('function');
    expect(typeof loginLimiter).toBe('function');
    expect(typeof registerLimiter).toBe('function');
    expect(typeof emailLimiter).toBe('function');
  });

});