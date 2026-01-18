import { transporter } from './email';
import { emailTemplates } from './emailTemplates';

type TemplateResult = {
  subject: string;
  html: string;
};

const sendEmail = async (
  to: string,
  template: TemplateResult
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: template.subject,
    html: template.html
  });
};



/* =====================================================
   EMAILS DISPONÍVEIS
   ===================================================== */


export const emailService = {
  cadastroRecebido: async (to: string, nome: string) => {
    const template = emailTemplates.cadastroRecebido(nome);
    await sendEmail(to, template);
  },

  codigo2FA: async (to: string, nome: string, codigo: string) => {
    const template = emailTemplates.codigo2FA(nome, codigo);
    await sendEmail(to, template);
  },

  aprovado: async (to: string, nome: string) => {
    const template = emailTemplates.aprovado(nome);
    await sendEmail(to, template);
  },

  enviarAtivacaoSenha: async (email: string, nome: string, link: string) => {
    const template = emailTemplates.ativacaoSenha(nome, link);
    await sendEmail(email, template);
  },

  resetSenha: async (to: string, nome: string, link: string) => {
    const template = emailTemplates.resetSenha(nome, link);
    await sendEmail(to, template);
  },

  resetEmail: async (
    to: string,
    nome: string,
    link: string,
    novoEmail: string
  ) => {
    const template = emailTemplates.resetEmail(nome, link, novoEmail);
    await sendEmail(to, template);
  },

  reprovado: async (to: string, nome: string) => {
    const template = emailTemplates.reprovado(nome);
    await sendEmail(to, template);
  },

  promovidoAdmin: async (to: string, nome: string) => {
    const template = emailTemplates.promovidoAdmin(nome);
    await sendEmail(to, template);
  },

  despromovidoAdmin: async (to: string, nome: string) => {
    const template = emailTemplates.despromovidoAdmin(nome);
    await sendEmail(to, template);
  }
};

