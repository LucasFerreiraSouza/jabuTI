import { emailService } from '../utils/emailService';
import { transporter } from '../utils/email';
import { emailTemplates } from '../utils/emailTemplates';

jest.mock('../utils/email');
jest.mock('../utils/emailTemplates');

describe('emailService', () => {
  beforeEach(() => {
    (transporter.sendMail as jest.Mock).mockClear();
  });

  it('deve enviar email de cadastro recebido', async () => {
    (emailTemplates.cadastroRecebido as jest.Mock).mockReturnValue({
      subject: 'teste',
      html: '<p>teste</p>'
    });

    await emailService.cadastroRecebido('email@test.com', 'Lucas');

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: 'email@test.com',
      subject: 'teste',
      html: '<p>teste</p>'
    });
  });

  it('deve enviar email de 2FA', async () => {
    (emailTemplates.codigo2FA as jest.Mock).mockReturnValue({
      subject: '2FA',
      html: '<p>2FA</p>'
    });

    await emailService.codigo2FA('email@test.com', 'Lucas', '1234');

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: 'email@test.com',
      subject: '2FA',
      html: '<p>2FA</p>'
    });
  });

  it('deve enviar email de aprovado', async () => {
    (emailTemplates.aprovado as jest.Mock).mockReturnValue({
      subject: 'aprovado',
      html: '<p>aprovado</p>'
    });

    await emailService.aprovado('email@test.com', 'Lucas');

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: 'email@test.com',
      subject: 'aprovado',
      html: '<p>aprovado</p>'
    });
  });

  it('deve enviar email de ativacaoSenha', async () => {
    (emailTemplates.ativacaoSenha as jest.Mock).mockReturnValue({
      subject: 'ativacao',
      html: '<p>ativacao</p>'
    });

    await emailService.enviarAtivacaoSenha('email@test.com', 'Lucas', 'link');

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: 'email@test.com',
      subject: 'ativacao',
      html: '<p>ativacao</p>'
    });
  });

  it('deve enviar email de resetSenha', async () => {
    (emailTemplates.resetSenha as jest.Mock).mockReturnValue({
      subject: 'reset',
      html: '<p>reset</p>'
    });

    await emailService.resetSenha('email@test.com', 'Lucas', 'link');

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: 'email@test.com',
      subject: 'reset',
      html: '<p>reset</p>'
    });
  });

  it('deve enviar email de resetEmail', async () => {
    (emailTemplates.resetEmail as jest.Mock).mockReturnValue({
      subject: 'resetEmail',
      html: '<p>resetEmail</p>'
    });

    await emailService.resetEmail('email@test.com', 'Lucas', 'link', 'novo@email.com');

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: 'email@test.com',
      subject: 'resetEmail',
      html: '<p>resetEmail</p>'
    });
  });

  it('deve enviar email de reprovado', async () => {
    (emailTemplates.reprovado as jest.Mock).mockReturnValue({
      subject: 'reprovado',
      html: '<p>reprovado</p>'
    });

    await emailService.reprovado('email@test.com', 'Lucas');

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: 'email@test.com',
      subject: 'reprovado',
      html: '<p>reprovado</p>'
    });
  });

  it('deve enviar email de promovidoAdmin', async () => {
    (emailTemplates.promovidoAdmin as jest.Mock).mockReturnValue({
      subject: 'promovido',
      html: '<p>promovido</p>'
    });

    await emailService.promovidoAdmin('email@test.com', 'Lucas');

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: 'email@test.com',
      subject: 'promovido',
      html: '<p>promovido</p>'
    });
  });

  it('deve enviar email de despromovidoAdmin', async () => {
    (emailTemplates.despromovidoAdmin as jest.Mock).mockReturnValue({
      subject: 'despromovido',
      html: '<p>despromovido</p>'
    });

    await emailService.despromovidoAdmin('email@test.com', 'Lucas');

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: 'email@test.com',
      subject: 'despromovido',
      html: '<p>despromovido</p>'
    });
  });
});
