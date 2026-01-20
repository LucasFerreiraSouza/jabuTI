export const emailService = {
  enviarAtivacaoSenha: jest.fn().mockResolvedValue(true),
  reprovado: jest.fn().mockResolvedValue(true),
  promovidoAdmin: jest.fn().mockResolvedValue(true),
  despromovidoAdmin: jest.fn().mockResolvedValue(true),
};
