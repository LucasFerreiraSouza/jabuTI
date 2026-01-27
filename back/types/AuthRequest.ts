import { Request } from 'express';

export interface AuthUser {
  id: string;
  role: 'ADMIN' |'ESTUDANTE';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
