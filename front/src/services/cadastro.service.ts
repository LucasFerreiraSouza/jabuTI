import { http } from "../api/http";

/* ============================
   Payloads
============================ */

export interface RegistrarUsuarioPayload {
  nome: string;
  email: string;
  captchaToken: string;
}

export interface SolicitarResetSenhaPayload {
  email: string;
  captchaToken: string;
}

export interface ResetarSenhaPayload {
  token: string;
  senha: string;
}

export interface SolicitarResetEmailPayload {
  email: string;
  novoEmail: string;
}

export interface ResetarEmailPayload {
  token: string;
}

export interface AtivarSenhaPayload {
  token: string;
  senha: string;
}

/* ============================
   Responses
============================ */

export interface MensagemResponse {
  mensagem: string;
}

/* ============================
   Cadastro / Conta
============================ */

/**
 * POST /cadastro/registrar
 */
export async function registrarUsuario(
  payload: RegistrarUsuarioPayload
) {
  const { data } = await http.post<MensagemResponse>(
    "/cadastro/registrar",
    payload
  );

  return data;
}

/**
 * POST /cadastro/ativar-senha/:token
 * (token também vai no body para bater com o controller)
 */
export async function ativarSenha(
  payload: AtivarSenhaPayload
) {
  const { token, senha } = payload;

  const { data } = await http.post<MensagemResponse>(
    `/cadastro/ativar-senha/${token}`,
    { token, senha }
  );

  return data;
}

/**
 * POST /cadastro/solicitar-reset-senha
 */
export async function solicitarResetSenha(
  payload: SolicitarResetSenhaPayload
) {
  const { data } = await http.post<MensagemResponse>(
    "/cadastro/solicitar-reset-senha",
    payload
  );

  return data;
}

/**
 * POST /cadastro/resetar-senha
 */
export async function resetarSenha(
  payload: ResetarSenhaPayload
) {
  const { data } = await http.post<MensagemResponse>(
    "/cadastro/resetar-senha",
    payload
  );

  return data;
}

/**
 * POST /cadastro/solicitar-reset-email
 */
export async function solicitarResetEmail(
  payload: SolicitarResetEmailPayload
) {
  const { data } = await http.post<MensagemResponse>(
    "/cadastro/solicitar-reset-email",
    payload
  );

  return data;
}

/**
 * POST /cadastro/resetar-email
 */
export async function resetarEmail(
  payload: ResetarEmailPayload
) {
  const { data } = await http.post<MensagemResponse>(
    "/cadastro/resetar-email",
    payload
  );

  return data;
}