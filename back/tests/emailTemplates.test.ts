import { emailTemplates } from '../utils/emailTemplates';

describe('Email Templates', () => {
  it('cadastroRecebido deve retornar subject e html com o nome', () => {
    const res = emailTemplates.cadastroRecebido('Lucas');
    expect(res.subject).toBe('Cadastro recebido - Jabuti');
    expect(res.html).toContain('Olá, Lucas');
  });

  it('codigo2FA deve retornar subject e html com nome e código', () => {
    const res = emailTemplates.codigo2FA('Lucas', '123456');
    expect(res.subject).toBe('Seu código de acesso - Jabuti');
    expect(res.html).toContain('123456');
  });

  it('aprovado deve retornar subject correto', () => {
    const res = emailTemplates.aprovado('Lucas');
    expect(res.subject).toBe('Conta aprovada - Jabuti');
    expect(res.html).toContain('Olá, Lucas');
  });

  it('ativacaoSenha deve retornar subject e link no html', () => {
    const res = emailTemplates.ativacaoSenha('Lucas', 'http://link.com');
    expect(res.subject).toBe('Ative sua conta - Jabuti');
    expect(res.html).toContain('http://link.com');
  });

  it('resetSenha deve retornar subject e link no html', () => {
    const res = emailTemplates.resetSenha('Lucas', 'http://link.com');
    expect(res.subject).toBe('Resetar senha - Jabuti');
    expect(res.html).toContain('http://link.com');
  });

  it('resetEmail deve retornar subject e novo email no html', () => {
    const res = emailTemplates.resetEmail('Lucas', 'http://link.com', 'novo@email.com');
    expect(res.subject).toBe('Confirmar troca de email - Jabuti');
    expect(res.html).toContain('novo@email.com');
  });

  it('reprovado deve retornar subject correto', () => {
    const res = emailTemplates.reprovado('Lucas');
    expect(res.subject).toBe('Cadastro não aprovado - Jabuti');
  });

  it('promovidoAdmin deve retornar subject correto', () => {
    const res = emailTemplates.promovidoAdmin('Lucas');
    expect(res.subject).toBe('Permissões atualizadas - Jabuti');
  });

  it('despromovidoAdmin deve retornar subject correto', () => {
    const res = emailTemplates.despromovidoAdmin('Lucas');
    expect(res.subject).toBe('Permissões atualizadas - Jabuti');
    expect(res.html).toContain('Você agora é um usuário estudante');
  });
});
