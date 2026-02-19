import { http } from "../api/http";

/* ============================
   DTOs
============================ */

export interface LoginPayload {
  email: string;
  senha: string;
  captchaToken: string;
}

export interface LoginResponse {
  token?: string;
  mensagem?: string;
  usuarioId?: string;
}

export interface ConfirmarCodigoPayload {
  usuarioId: string;
  codigo: string;
  captchaToken: string;
}

export interface ConfirmarCodigoResponse {
  token: string;
}

/* ============================
   Service
============================ */

export const authService = {
  login(payload: LoginPayload) {
    return http.post<LoginResponse>("/auth/login", payload);
  },

  confirmarCodigo(payload: ConfirmarCodigoPayload) {
    return http.post<ConfirmarCodigoResponse>(
      "/auth/confirmar-codigo",
      payload
    );
  },

  logout() {
    return http.post("/auth/logout");
  },

  habilitar2FA() {
    return http.patch("/auth/2fa/habilitar");
  },

  desabilitar2FA() {
    return http.patch("/auth/2fa/desabilitar");
  }
};
