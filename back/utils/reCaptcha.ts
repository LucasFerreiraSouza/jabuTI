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
    const { data } = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret,
          response: token
        }
      }
    );
    return data;
  } catch (err) {
    return {
      success: false,
      'error-codes': ['recaptcha-error']
    };
  }
};

export default validateCaptcha;