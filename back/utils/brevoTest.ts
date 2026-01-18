import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

async function testBrevo() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.TEST_EMAIL_TO || process.env.SMTP_USER,
    subject: 'Teste Brevo - Jabuti',
    text: 'Se você recebeu este email, o Brevo está funcionando!',
    html: `<p>Se você recebeu este email, o <b>Brevo</b> está funcionando!</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso!');
    console.log('MessageId:', info.messageId);
    console.log('Response:', info.response);
  } catch (error: any) {
    console.error('Erro ao enviar email:', error.message);
  }
}

testBrevo();
