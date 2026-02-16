import nodemailer from 'nodemailer';
import { transporter } from '../../utils/email'; // ajuste o path conforme seu projeto

jest.mock('nodemailer');

const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('Nodemailer transporter', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('deve criar o transporter com as configurações corretas', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'password';

    // mock do createTransport
    const mockCreateTransport = jest.fn();
    mockedNodemailer.createTransport.mockImplementation(mockCreateTransport);

    // importa novamente para pegar o transporter com o mock
    require('../../utils/email');

    expect(mockedNodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'user@example.com',
        pass: 'password',
      },
    });
  });
});