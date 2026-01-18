export const emailTemplates = {
  cadastroRecebido: (nome: string) => ({
    subject: 'Cadastro recebido - Jabuti',
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Olá, ${nome} 👋</p>
          <p>Seu cadastro foi recebido com sucesso.</p>
          <p>Assim que um administrador aprovar, você será avisado.</p>
          <p style="font-size:12px;color:#666;">
            Se você não solicitou esse email, ignore.
          </p>
        </body>
      </html>
    `
  }),

  codigo2FA: (nome: string, codigo: string) => ({
    subject: 'Seu código de acesso - Jabuti',
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Olá, ${nome}</p>
          <p>Seu código de verificação é:</p>
          <h2>${codigo}</h2>
          <p>Este código expira em 10 minutos.</p>
        </body>
      </html>
    `
  }),

  aprovado: (nome: string) => ({
    subject: 'Conta aprovada - Jabuti',
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Olá, ${nome} 🎉</p>
          <p>Sua conta foi aprovada e já pode acessar a plataforma.</p>
        </body>
      </html>
    `
  }),

  ativacaoSenha: (nome: string, link: string) => ({
    subject: 'Ative sua conta - Jabuti',
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Olá, ${nome} 👋</p>
          <p>Sua conta foi aprovada com sucesso!</p>
          <p>Para criar sua senha, clique no botão abaixo:</p>
          <p>
            <a href="${link}" target="_blank" style="display:inline-block;padding:10px 20px;background:#4F46E5;color:#fff;border-radius:6px;text-decoration:none;">
              Criar minha senha
            </a>
          </p>
          <p style="font-size:12px;color:#666;">
            Este link expira em 24 horas.
          </p>
        </body>
      </html>
    `
  }),

  reprovado: (nome: string) => ({
    subject: 'Cadastro não aprovado - Jabuti',
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Olá, ${nome}</p>
          <p>Seu cadastro não foi aprovado neste momento.</p>
        </body>
      </html>
    `
  }),

  promovidoAdmin: (nome: string) => ({
    subject: 'Permissões atualizadas - Jabuti',
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Olá, ${nome} 🚀</p>
          <p>Você agora possui permissões de administrador.</p>
        </body>
      </html>
    `
  }),

  despromovidoAdmin: (nome: string) => ({
    subject: 'Permissões atualizadas - Jabuti',
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Olá, ${nome} 👋</p>
          <p>Suas permissões de administrador foram removidas.</p>
          <p>Você agora é um usuário estudante.</p>
        </body>
      </html>
    `
  }),


  resetSenha: (nome: string, link: string) => ({
    subject: 'Resetar senha - Jabuti',
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Olá, ${nome} 👋</p>
          <p>Para resetar sua senha, clique no botão abaixo:</p>
          <p>
            <a href="${link}" target="_blank" style="display:inline-block;padding:10px 20px;background:#4F46E5;color:#fff;border-radius:6px;text-decoration:none;">
              Resetar minha senha
            </a>
          </p>
          <p style="font-size:12px;color:#666;">
            Este link expira em 1 hora.
          </p>
        </body>
      </html>
    `
  }),

  resetEmail: (nome: string, link: string, novoEmail: string) => ({
    subject: 'Confirmar troca de email - Jabuti',
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Olá, ${nome} 👋</p>
          <p>Você solicitou trocar seu email para: <b>${novoEmail}</b></p>
          <p>Para confirmar a troca, clique no botão abaixo:</p>
          <p>
            <a href="${link}" target="_blank" style="display:inline-block;padding:10px 20px;background:#4F46E5;color:#fff;border-radius:6px;text-decoration:none;">
              Confirmar troca de email
            </a>
          </p>
          <p style="font-size:12px;color:#666;">
            Este link expira em 1 hora.
          </p>
        </body>
      </html>
    `
  })
};
