import axios from 'axios';

type RecaptchaResponse = {
  success: boolean;
  score?: number;
  action?: string;
  'challenge_ts'?: string;
  hostname?: string;
  'error-codes'?: string[];
};

const validateCaptcha = async (token: string): Promise<RecaptchaResponse> => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    throw new Error('RECAPTCHA_SECRET_KEY não está configurada');
  }

  try {
    const response = await axios.post<RecaptchaResponse>(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret,
          response: token
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('reCAPTCHA error:', error);
    return {
      success: false,
      'error-codes': ['recaptcha-error']
    };
  }
};

export default validateCaptcha;
