import rateLimit from 'express-rate-limit';

/* =====================
   LIMITADOR GERAL
   ===================== */
export const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

/* =====================
   LOGIN / 2FA (IP)
   ===================== */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 tentativas
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente mais tarde.' }
});

/* =====================
   CADASTRO (IP)
   ===================== */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1h
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitos cadastros a partir deste IP.' }
});

/* =====================
   EMAIL / AÇÕES SENSÍVEIS (IP)
   ===================== */
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Limite de envio de e-mails atingido.' }
});
